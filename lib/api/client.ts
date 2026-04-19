// lib/api/client.ts
// Type-safe API client for frontend API calls

export interface ClientConfig {
  baseUrl?: string
  timeout?: number
  headers?: Record<string, string>
}

class ApiClient {
  private config: Required<ClientConfig>

  constructor(config: ClientConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || process.env['NEXT_PUBLIC_API_URL'] || '',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options })
  }

  /**
   * Core request method with error handling
   */
  private async request<T>(endpoint: string, init: RequestInit): Promise<T> {
    const url = this.getUrl(endpoint)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: { ...this.config.headers, ...init.headers },
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.error?.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeout)
      throw error
    }
  }

  /**
   * Build full URL
   */
  private getUrl(endpoint: string): string {
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${this.config.baseUrl}${path}`
  }

  /**
   * Set base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl
  }

  /**
   * Set headers
   */
  setHeaders(headers: Record<string, string>): void {
    this.config.headers = { ...this.config.headers, ...headers }
  }

  /**
   * Add auth token
   */
  setAuthToken(token: string): void {
    this.setHeaders({ Authorization: `Bearer ${token}` })
  }

  /**
   * Clear auth token
   */
  clearAuthToken(): void {
    const { Authorization, ...rest } = this.config.headers
    this.config.headers = rest
  }
}

export const apiClient = new ApiClient()
