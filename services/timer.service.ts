import { createClient } from '@/lib/supabase/client'
import type { StudySession } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function startSession(
  subjectId: string | null,
  sessionType: string
): Promise<ApiResponse<StudySession>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('study_sessions')
      .insert({
        student_id: profile.id,
        subject_id: subjectId,
        duration_seconds: 0,
        session_type: sessionType,
        completed: false,
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudySession)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function completeSession(
  id: string,
  durationSeconds: number,
  notes: string | null = null
): Promise<ApiResponse<StudySession>> {
  try {
    const { data, error } = await createClient()
      .from('study_sessions')
      .update({ duration_seconds: durationSeconds, completed: true, notes })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudySession)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getSessions(params?: {
  subjectId?: string
  limit?: number
}): Promise<ApiResponse<StudySession[]>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    let query = createClient()
      .from('study_sessions')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(params?.limit ?? 20)

    if (params?.subjectId) {
      query = query.eq('subject_id', params.subjectId)
    }

    const { data, error } = await query
    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudySession[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getStudyStats(): Promise<ApiResponse<{
  totalMinutes: number
  sessionsCompleted: number
  currentStreak: number
  longestStreak: number
}>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('study_sessions')
      .select('duration_seconds, created_at, completed')
      .eq('student_id', profile.id)
      .eq('completed', true)

    if (error) throw new ApiError(error.message, 400)

    const totalMinutes = Math.round((data as unknown as StudySession[]).reduce(
      (sum, s) => sum + s.duration_seconds, 0
    ) / 60)

    const sessionsCompleted = (data as unknown as StudySession[]).length

    const dates = new Set(
      (data as unknown as StudySession[]).map(s =>
        new Date(s.created_at).toISOString().split('T')[0]
      )
    )

    let currentStreak = 0
    let longestStreak = 0
    const sortedDates = Array.from(dates).sort().reverse()

    if (sortedDates.length > 0) {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (sortedDates[0] === today || sortedDates[0] === yesterday) {
        currentStreak = 1
        for (let i = 1; i < sortedDates.length; i++) {
          const prev = new Date(sortedDates[i - 1])
          const curr = new Date(sortedDates[i])
          const diff = (prev.getTime() - curr.getTime()) / 86400000
          if (diff === 1) {
            currentStreak++
          } else {
            break
          }
        }
      }

      longestStreak = 1
      let streak = 1
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1])
        const curr = new Date(sortedDates[i])
        const diff = (prev.getTime() - curr.getTime()) / 86400000
        if (diff === 1) {
          streak++
          longestStreak = Math.max(longestStreak, streak)
        } else {
          streak = 1
        }
      }
    }

    return successResponse({ totalMinutes, sessionsCompleted, currentStreak, longestStreak })
  } catch (error) {
    return handleApiError(error)
  }
}
