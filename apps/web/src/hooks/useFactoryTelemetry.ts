import { useEffect, useRef, useState } from 'react';
import { apiClient } from '../lib/api';

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

export function useFactoryTelemetry(factoryId: string, _initialKw: number = 847.3) {
  const [data, setData] = useState<TelemetryStreamPacket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const connectWebSocket = async () => {
      // H11: Fetch single-use 30-second ticket from backend before connecting
      let ticketParam = '';
      try {
        const ticketRes = await apiClient.getWSTicket();
        if (ticketRes && ticketRes.ticket) {
          ticketParam = `?ticket=${encodeURIComponent(ticketRes.ticket)}`;
        }
      } catch {
        // If not authenticated or backend unavailable, continue with ticketless attempt
      }

      if (isCancelled) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const defaultHost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
          ? `${window.location.hostname}:8080`
          : window.location.host;

      const wsBase = import.meta.env.VITE_WS_URL || `${protocol}//${defaultHost}/v1/ws`;
      const wsUrl = `${wsBase}/factories/${factoryId}${ticketParam}`;

      try {
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
          if (!isCancelled) setIsConnected(true);
        };

        ws.current.onmessage = (e) => {
          if (isCancelled) return;
          try {
            const parsed = JSON.parse(e.data);
            setData(parsed);
          } catch {
            // ignore parsing error
          }
        };

        ws.current.onerror = () => {
          if (!isCancelled) setIsConnected(false);
        };

        ws.current.onclose = () => {
          if (!isCancelled) setIsConnected(false);
        };
      } catch {
        if (!isCancelled) setIsConnected(false);
      }
    };

    connectWebSocket();

    return () => {
      isCancelled = true;
      ws.current?.close();
    };
  }, [factoryId]);

  return { livePacket: data, isWebSocketLive: isConnected };
}
