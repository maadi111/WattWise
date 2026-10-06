export type UserRole = 'super_admin' | 'factory_owner' | 'factory_manager' | 'viewer';

export interface AuthClaims {
  userId: string;
  email: string;
  role: UserRole;
  factoryIds: string[];
  exp: number;
}

export interface LoginRequest {
  email: string;
  passwordHash: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    role: UserRole;
    factoryIds: string[];
  };
}

export interface TelemetryPacket {
  factory_id: string;
  node_id: string;
  ts: number; // Unix epoch ms
  power_kw: number;
  voltage_v: number;
  freq_hz: number;
  on_grid: boolean;
  pf: number;
}

export interface FactoryDto {
  id: string;
  name: string;
  sector: 'TEXTILE' | 'SURGICAL' | 'FOOD' | 'PHARMA' | 'STEEL';
  city: string;
  wapdaFeeder: string;
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  gridTariffPkr: number;
  dieselTariffPkr: number;
}

export interface PredictionDto {
  outage_probability: number;
  trigger_automation: boolean;
  confidence: number;
  predicted_window?: {
    start: string;
    end: string;
  };
}

export interface ScheduleItemDto {
  process_id: string;
  start_slot: number;
  end_slot: number;
  on_generator: boolean;
  estimated_cost_pkr: number;
}
