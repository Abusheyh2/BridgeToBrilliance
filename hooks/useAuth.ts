// hooks/useAuth.ts
// Custom hook for authentication

import { useEffect, useState } from 'react'
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { authService } from '@/services/auth.service'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export interface UseAuthReturn {
  user: User | null
  loading: boolean
  error: Error | null
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Check current user
    const checkUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Auth check failed'))
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, _session: Session) => {
        setUser(_session?.user ?? null)
        setError(null)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const logout = async () => {
    try {
      setLoading(true)
      await authService.logout()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Logout failed'))
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
  }
}
