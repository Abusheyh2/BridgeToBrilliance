// services/auth.service.ts
// Authentication business logic

import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { UnauthorizedError, ValidationError } from '@/lib/api/errors'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials extends LoginCredentials {
  fullName: string
  role: 'student' | 'teacher'
}

export interface AuthResponse {
  user: User
  token: string
}

class AuthService {
  private supabase = createClient()

  /**
   * Sign up a new user
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { email, password, fullName, role } = credentials

    // Validate email format
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Invalid email format')
    }

    // Validate password strength
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters')
    }

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    })

    if (error) {
      throw new ValidationError(error.message)
    }

    if (!data.user) {
      throw new UnauthorizedError('Registration failed')
    }

    return {
      user: data.user,
      token: data.session?.access_token || '',
    }
  }

  /**
   * Sign in an existing user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new UnauthorizedError('Invalid email or password')
    }

    if (!data.user || !data.session) {
      throw new UnauthorizedError('Login failed')
    }

    return {
      user: data.user,
      token: data.session.access_token,
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser()

    if (error || !data.user) {
      return null
    }

    return data.user
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    await this.supabase.auth.signOut()
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    if (!this.isValidEmail(email)) {
      throw new ValidationError('Invalid email format')
    }

    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }
}

export const authService = new AuthService()
