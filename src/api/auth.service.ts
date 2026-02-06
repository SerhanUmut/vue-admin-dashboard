import { httpClient } from './http.client'
import type { AuthResponse, LoginCredentials, User } from '@/types'

// Mock user for demonstration
const mockUser: User = {
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  permissions: ['orders.read', 'orders.write', 'customers.read', 'customers.write', 'settings.read', 'settings.write'],
  createdAt: '2023-01-01T00:00:00Z',
  lastLoginAt: new Date().toISOString()
}

class AuthService {
  private useMock = true // Toggle for API vs mock data

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (this.useMock) {
      // Simulate login - accept any credentials for demo
      await new Promise(resolve => setTimeout(resolve, 800))
      
      if (credentials.email && credentials.password) {
        const response: AuthResponse = {
          user: { ...mockUser, email: credentials.email, lastLoginAt: new Date().toISOString() },
          accessToken: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        return response
      }
      
      throw { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS', statusCode: 401 }
    }
    
    const response = await httpClient.post<AuthResponse>('/auth/login', credentials)
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    localStorage.setItem('user', JSON.stringify(response.user))
    return response
  }

  async logout(): Promise<void> {
    if (!this.useMock) {
      try {
        await httpClient.post('/auth/logout')
      } catch {
        // Ignore logout errors
      }
    }
    
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  }

  async getCurrentUser(): Promise<User | null> {
    const userJson = localStorage.getItem('user')
    if (userJson) {
      try {
        return JSON.parse(userJson)
      } catch {
        return null
      }
    }
    
    if (this.useMock) {
      return null
    }
    
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return null
    }
    
    try {
      return await httpClient.get<User>('/auth/me')
    } catch {
      return null
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken')
    
    if (this.useMock) {
      if (refreshToken) {
        const response: AuthResponse = {
          user: mockUser,
          accessToken: 'mock-jwt-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }
        
        localStorage.setItem('accessToken', response.accessToken)
        localStorage.setItem('refreshToken', response.refreshToken)
        
        return response
      }
      throw { message: 'No refresh token', code: 'NO_REFRESH_TOKEN', statusCode: 401 }
    }
    
    const response = await httpClient.post<AuthResponse>('/auth/refresh', { refreshToken })
    localStorage.setItem('accessToken', response.accessToken)
    localStorage.setItem('refreshToken', response.refreshToken)
    return response
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken')
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken')
  }
}

export const authService = new AuthService()
