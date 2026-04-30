// hooks/useProfile.ts
// Custom hook for user profile

import { useCallback, useEffect, useState } from 'react'
import { profileService, type UserProfile } from '@/services/profile.service'

export interface UseProfileReturn {
  profile: UserProfile | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useProfile(userId: string | null): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(!!userId)
  const [error, setError] = useState<Error | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await profileService.getProfile(userId)
      setProfile(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  }
}
