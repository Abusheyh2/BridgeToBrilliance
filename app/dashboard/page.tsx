'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDashboard } from './DashboardContext'

export default function DashboardIndexPage() {
  const router = useRouter()
  const { role } = useDashboard()

  useEffect(() => {
    if (role === 'teacher') {
      router.replace('/dashboard/teacher')
    } else {
      router.replace('/dashboard/student')
    }
  }, [role, router])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold text-slate-500">Loading your academic portal...</p>
      </div>
    </div>
  )
}
