package ingest

import (
	"context"
	"encoding/json"
	"strings"
	"sync"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api/write"
	"github.com/rs/zerolog/log"
	"github.com/segmentio/kafka-go"

	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/db"
)

type TelemetryPayload struct {
	FactoryID   string    `json:"factory_id"`
	NodeID      string    `json:"node_id"`
	Timestamp   time.Time `json:"timestamp"`
	VoltageV    float64   `json:"voltage_v"`
	CurrentA    float64   `json:"current_a"`
	FrequencyHz float64   `json:"frequency_hz"`
	PowerFactor float64   `json:"power_factor"`
	PowerKW     float64   `json:"power_kw"`
	GridStatus  string    `json:"grid_status"`
}

type Pipeline struct {
	writer  *kafka.Writer
	reader  *kafka.Reader
	influx  influxdb2.Client
	running bool
	mu      sync.Mutex
	stopCh  chan struct{}
}

var GlobalPipeline *Pipeline

// StartPipeline initializes and launches the MQTT -> Kafka -> InfluxDB ingestion pipeline
func StartPipeline(ctx context.Context, cfg *config.Config) *Pipeline {
	p := &Pipeline{
		stopCh: make(chan struct{}),
	}

	if cfg.KafkaBrokers != "" {
		brokers := strings.Split(cfg.KafkaBrokers, ",")
		topic := "factory-telemetry-raw"

		p.writer = &kafka.Writer{
			Addr:         kafka.TCP(brokers...),
			Topic:        topic,
			Balancer:     &kafka.LeastBytes{},
			BatchSize:    100,
			BatchTimeout: 50 * time.Millisecond,
		}

		p.reader = kafka.NewReader(kafka.ReaderConfig{
			Brokers:  brokers,
			GroupID:  "wattwise-influx-ingester",
			Topic:    topic,
			MinBytes: 10e3, // 10KB
			MaxBytes: 10e6, // 10MB
		})

		p.running = true
		go p.consumeLoop(ctx)
		log.Info().Str("topic", topic).Msg("Kafka ingestion pipeline started successfully.")
	} else {
		log.Info().Msg("KAFKA_BROKERS not set; telemetry pipeline running in simulation streaming mode.")
	}

	GlobalPipeline = p
	return p
}

// PublishRawTelemetry writes an incoming telemetry packet to Kafka
func (p *Pipeline) PublishRawTelemetry(ctx context.Context, payload TelemetryPayload) error {
	if p == nil || p.writer == nil {
		// If Kafka is unconfigured, write directly to InfluxDB if available
		if db.GlobalClients.Influx != nil {
			p.writeToInflux(ctx, payload)
		}
		return nil
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	msg := kafka.Message{
		Key:   []byte(payload.FactoryID + ":" + payload.NodeID),
		Value: data,
		Time:  payload.Timestamp,
	}

	return p.writer.WriteMessages(ctx, msg)
}

func (p *Pipeline) consumeLoop(ctx context.Context) {
	for {
		select {
		case <-ctx.Done():
			return
		case <-p.stopCh:
			return
		default:
			msg, err := p.reader.ReadMessage(ctx)
			if err != nil {
				time.Sleep(500 * time.Millisecond)
				continue
			}

			var payload TelemetryPayload
			if err := json.Unmarshal(msg.Value, &payload); err == nil {
				p.writeToInflux(ctx, payload)
			}
		}
	}
}

func (p *Pipeline) writeToInflux(ctx context.Context, payload TelemetryPayload) {
	if db.GlobalClients.Influx == nil {
		return
	}

	writeAPI := db.GlobalClients.Influx.WriteAPIBlocking("wattwise", "factory_telemetry")
	point := write.NewPoint(
		"factory_telemetry",
		map[string]string{
			"factory_id":  payload.FactoryID,
			"node_id":     payload.NodeID,
			"grid_status": payload.GridStatus,
		},
		map[string]interface{}{
			"voltage_v":    payload.VoltageV,
			"current_a":    payload.CurrentA,
			"frequency_hz": payload.FrequencyHz,
			"power_factor": payload.PowerFactor,
			"power_kw":     payload.PowerKW,
		},
		payload.Timestamp,
	)

	if err := writeAPI.WritePoint(ctx, point); err != nil {
		log.Warn().Err(err).Msg("Failed to write telemetry point to InfluxDB")
	}
}

func (p *Pipeline) Stop() {
	p.mu.Lock()
	defer p.mu.Unlock()
	if !p.running {
		return
	}
	p.running = false
	close(p.stopCh)
	if p.reader != nil {
		_ = p.reader.Close()
	}
	if p.writer != nil {
		_ = p.writer.Close()
	}
	log.Info().Msg("Ingestion pipeline stopped.")
}
