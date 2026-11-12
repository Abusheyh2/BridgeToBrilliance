'use client'

import { createContext, useContext } from 'react'
import type { Profile } from '@/types/database.types'

export interface DashboardContextType {
  profile: Profile | null
  role: 'student' | 'teacher' | 'admin'
  isDemoMode: boolean
  toggleRole: (targetRole: 'student' | 'teacher') => void
}

export const DashboardContext = createContext<DashboardContextType>({
  profile: null,
  role: 'student',
  isDemoMode: true,
  toggleRole: () => {},
})

export const useProfile = () => {
  const ctx = useContext(DashboardContext)
  return ctx.profile
}

export const useDashboard = () => useContext(DashboardContext)
