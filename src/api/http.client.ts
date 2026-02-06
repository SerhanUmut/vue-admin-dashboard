import type { ApiError } from '@/types'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | null | undefined>
}

class HttpClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    return localStorage.getItem('accessToken')
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }
    
    return url.toString()
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...requestConfig } = config
    const url = this.buildUrl(endpoint, params)
    
    const token = this.getAuthToken()
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers
    }

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...requestConfig,
        headers
      })

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: response.statusText,
          code: 'UNKNOWN_ERROR',
          statusCode: response.status
        }))
        throw error
      }

      if (response.status === 204) {
        return {} as T
      }

      return await response.json()
    } catch (error) {
      if ((error as ApiError).statusCode) {
        throw error
      }
      throw {
        message: 'Network error',
        code: 'NETWORK_ERROR',
        statusCode: 0
      } as ApiError
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | null | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const httpClient = new HttpClient(BASE_URL)
