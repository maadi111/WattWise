const API_BASE =
  (import.meta.env.VITE_API_URL as string) ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/v1'
    : '/v1');

export class WattWiseApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('ww_access_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('ww_access_token', token);
    } else {
      localStorage.removeItem('ww_access_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        throw new Error(`API error ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err) {
      console.warn(`[WattWise API] Backend unreachable at ${endpoint}, using simulated fallback`, err);
      throw err;
    }
  }

  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getFactories() {
    return this.request<any[]>('/factories');
  }

  async getTelemetry(factoryId: string) {
    return this.request<any>(`/factories/${factoryId}/telemetry/live`);
  }

  async getSavings(factoryId: string) {
    return this.request<any[]>(`/factories/${factoryId}/savings`);
  }

  async getInvoices(factoryId: string) {
    return this.request<any[]>(`/factories/${factoryId}/invoices`);
  }
}

export const apiClient = new WattWiseApiClient();
