import { useEffect, useRef, useState } from 'react';

export interface TelemetryStreamPacket {
  factory_id: string;
  timestamp: string;
  grid_status: string;
  active_source: string;
  grid_voltage: number;
  grid_frequency: number;
  total_kw: number;
  power_factor_avg: number;
  cost_per_hour_pkr: number;
  hourly_waste_avoided_pkr: number;
}

export function useFactoryTelemetry(factoryId: string, initialKw: number = 847.3) {
  const [data, setData] = useState<TelemetryStreamPacket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Attempt WebSocket connection to Go backend (Sprint 2)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = `${protocol}//${host}:8080/v1/ws/factories/${factoryId}`;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        setIsConnected(true);
      };

      ws.current.onmessage = (e) => {
        try {
          const parsed = JSON.parse(e.data);
          setData(parsed);
        } catch {
          // ignore parsing error
        }
      };

      ws.current.onerror = () => {
        setIsConnected(false);
      };

      ws.current.onclose = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      ws.current?.close();
    };
  }, [factoryId]);

  return { livePacket: data, isWebSocketLive: isConnected };
}
