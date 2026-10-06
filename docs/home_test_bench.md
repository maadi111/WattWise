# WATTWISE™ — PHYSICAL HOME TEST BENCH SETUP GUIDE
## Hardware Validation Laboratory Without a Factory (Phase 2 Playbook, Method 2)

> **The Core Insight:**
> You do not need a textile mill in Faisalabad to validate WattWise. You need **equivalent electrical signals**. A Rs. 15,000–32,000 home test bench produces exactly the same voltage readings, frequency sags, and current waveforms that a factory does — just at household scale instead of industrial scale. The CT clamp sensor does not know if it is clamped around an industrial Tsudakoma airjet loom or a domestic electric heater.

---

## 1. Physical Layout Schematic

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      WATTWISE HOME TEST BENCH SCHEMATIC                         │
└─────────────────────────────────────────────────────────────────────────────────┘

 [ 230V AC Mains Wall Socket ]
           │
           ▼
    [ Variac 0-240V ] ──(Voltage Sag Simulation)──┐
                                                  ▼
                                      [ Multi-Socket Power Strip ]
                                       │       │       │       │
                     ┌─────────────────┘       │       │       └─────────────────┐
                     ▼                         ▼       ▼                         ▼
             [ Socket 1: Laptop ]       [ Socket 2:   [ Socket 3:        [ Socket 4: Drill ]
              "Weaving Shed Base"        Room Heater ]  Desk Fan ]        "Motor/CNC Load"
              (~65W baseline)            "Dyeing Vat"   "HVAC Inductive"  (~300W load)
                                         (1000W)        (75W, PF 0.74)
                     │                         │       │                         │
                     ▼                         ▼       ▼                         ▼
              [ SCT-013-100 ]            [ SCT-013 ] [ SCT-013 ]          [ SCT-013-100 ]
              (Split-core CT)            (Split-core) (Split-core)        (Split-core CT)
                     │                         │       │                         │
                     └─────────────┬───────────┴───────┴─────────────────────────┘
                                   ▼
                         [ ADS1115 16-Bit ADC ]
                         (Analog-to-Digital I2C)
                                   │
                                   ▼
                       [ Raspberry Pi CM4 + IO ]
                       (Running WattBrain Edge OS)
                        ├── RS-485 Modbus Bus (MAX485)
                        ├── BCM2835 Hardware Watchdog
                        └── 72-Hour SQLite Ring Buffer
                                   │
                                   ▼ [ Jazz 4G Dongle / WiFi ]
                          (MQTT / TLS Port 8883)
                                   │
                                   ▼
                      [ WattWise Cloud Platform ]
```

---

## 2. Bill of Materials (BOM) & Sourcing in Pakistan

All items are available immediately off-the-shelf in Pakistani electronics markets (Hafeez Centre Lahore, Raja Bazaar Rawalpindi, Hall Road Lahore) or via Daraz.pk / AliExpress:

| Item | Component Specification | Pakistani Source | Cost (PKR) |
|---|---|---|---|
| **Edge Compute** | Raspberry Pi CM4 (4GB RAM, 32GB eMMC) + IO Board | Hafeez Centre / AliExpress | Rs. 12,000 |
| **CT Clamps** | 5× SCT-013-100 Split-Core Current Transformers (100A / 0.05V) | Daraz / Hafeez Centre | Rs. 3,500 |
| **ADC Interface** | ADS1115 16-Bit 4-Channel I2C ADC Module with 30Ω burden resistors | Hall Road / Daraz.pk | Rs. 800 |
| **Serial Bus** | USB-to-RS485 Converter (CH340 chip, 3.3V/5V) | Daraz.pk / Electronics shops | Rs. 500 |
| **Modbus Transceiver** | 2× MAX485 TTL-to-RS485 Modules | Daraz.pk components | Rs. 400 |
| **Simulated Relay** | 2× Tuya-compatible WiFi Smart Plugs (16A rating) | Daraz.pk / Smart Home store | Rs. 1,800 |
| **Resistive Load** | 1kW Electric Convection Heater (simulates Dyeing Vat) | Local appliance store | Rs. 2,500 |
| **Voltage Regulator** | Variac / Variable Autotransformer 0–250V (simulates grid sags) | Raja Bazaar / Hall Road | Rs. 4,000 |
| **Ground Truth Meter** | UNI-T UT210E True-RMS Digital Clamp Meter | Hardware tool shop | Rs. 3,500 |
| **Cellular Uplink** | Jazz or Telenor 4G LTE USB Dongle + Data SIM | Telecom franchise | Rs. 2,000 |
| **Enclosure** | Industrial DIN-Rail ABS Enclosure + terminal blocks | Electrical wholesale market | Rs. 1,500 |
| **TOTAL BENCH COST** | **Complete Factory Hardware Lab** | | **Rs. ~32,500** |

*(Note: If Raspberry Pi CM4 is already on hand, total lab cost is under Rs. 20,000).*

---

## 3. Household-to-Factory Electrical Mapping

| Factory Asset | Physical Home Bench Load | Electrical Signature Validated |
|---|---|---|
| **Weaving Shed Base** (Airjet Looms) | Laptop + Charger (~65W) | Baseline continuous telemetry, steady voltage draw |
| **Dyeing Vat #03** (High-Temp Bath) | 1,000W Electric Convection Heater | High resistive demand; tests thermal threshold math |
| **HVAC Chiller / Compressors** | 75W Desk Fan (Induction Motor) | Inductive reactive power draw; **tests Power Factor drop below 0.85** |
| **Machine Spindles / CNC** | 300W Electric Power Drill (dimmer speed) | Transient harmonic jitter and motor startup spikes |
| **ATS Switchgear** (VCB Contactor) | Tuya 16A Smart Plug via Local API | Tests sub-cycle pre-emptive disconnect and relay fail-safe |
| **11kV Feeder Sag** (FESCO Trips) | Variac dialed down from 230V $\rightarrow$ 195V | Validates Model 1 (GOP) $dV/dt$ rate-of-change trip detection |

---

## 4. Step-by-Step Validation Experiments

### Experiment 1: Grid Load Shedding (Full Outage)
* **Action:** Pull the main power strip plug for 30 seconds.
* **Expected Result:** WattBrain detects voltage collapse within 8ms, logs transition in local SQLite circular buffer, and reconciles telemetry when reconnected without a single packet dropped.

### Experiment 2: Pre-Emptive Generator Switchover (ATS)
* **Action:** Toggle smart plug OFF then ON via WattBrain relay actuation command.
* **Expected Result:** Measure relay response time ($< 8\text{ ms}$). Load resumes without gap in InfluxDB telemetry.

### Experiment 3: High-Load Spike (Loom Startup)
* **Action:** Switch 1kW electric heater ON instantaneously.
* **Expected Result:** Model 4 (Anomaly Detector) classifies load jump as expected batch startup rather than false positive alarm.

### Experiment 4: CT Sensor Tamper / Displacement
* **Action:** Unclamp one CT sensor mid-session.
* **Expected Result:** Isolation Forest flags signal ratio divergence within 90 seconds and dispatches an alert.

### Experiment 5: 4G Network Outage (Offline Buffer Test)
* **Action:** Disable WiFi and cellular connection on the RPi for 2 hours while heater and fan run.
* **Expected Result:** WattBrain holds all 2 hours of 10Hz readings in local SQLite database. When connection is restored, all data flushes to TimescaleDB/InfluxDB with 100% time-series continuity.
