const API_BASE =
  (import.meta.env.VITE_API_URL as string) ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080/v1'
    : '/v1');

export const isDevMockMode = (): boolean => {
  return import.meta.env.VITE_USE_MOCKS === 'true';
};

export class WattWiseApiClient {
  // M5: Access token is kept strictly in-memory, immune to XSS theft from localStorage
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
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
        credentials: 'include', // Include HttpOnly cookies (ww_refresh)
      });

      if (!res.ok) {
        let errMsg = `API error ${res.status}: ${res.statusText}`;
        try {
          const body = await res.json();
          if (body.error) errMsg = body.error;
        } catch {
          // ignore json parse error
        }
        throw new Error(errMsg);
      }

      return await res.json();
    } catch (err) {
      if (isDevMockMode()) {
        console.warn(`[WattWise API] Backend unreachable at ${endpoint}, VITE_USE_MOCKS is enabled`, err);
      }
      throw err;
    }
  }

  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async refresh() {
    return this.request<{ access_token: string; expires_in: number }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // H11: Fetch single-use 30s ticket for WebSocket connection
  async getWSTicket() {
    return this.request<{ ticket: string; expires_in: number }>('/ws-ticket', {
      method: 'POST',
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

  async generateInvoice(factoryId: string, month: string) {
    return this.request<any>(`/factories/${factoryId}/invoices/generate`, {
      method: 'POST',
      body: JSON.stringify({ month }),
    });
  }

  async getPredictions(factoryId: string) {
    return this.request<any>(`/factories/${factoryId}/predictions/schedule`);
  }
}

export const apiClient = new WattWiseApiClient();
