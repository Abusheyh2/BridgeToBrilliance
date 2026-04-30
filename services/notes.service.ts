import { createClient } from '@/lib/supabase/client'
import type { StudyNote } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function createNote(
  title: string,
  content: string,
  subjectId: string | null,
  lessonId: string | null,
  tags: string[],
  color: string
): Promise<ApiResponse<StudyNote>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('study_notes')
      .insert({
        student_id: profile.id,
        title,
        content,
        subject_id: subjectId,
        lesson_id: lessonId,
        tags,
        color,
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudyNote)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getNotes(params?: { subjectId?: string; tag?: string }): Promise<ApiResponse<StudyNote[]>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    let query = createClient()
      .from('study_notes')
      .select('*')
      .eq('student_id', profile.id)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })

    if (params?.subjectId) {
      query = query.eq('subject_id', params.subjectId)
    }
    if (params?.tag) {
      query = query.contains('tags', [params.tag])
    }

    const { data, error } = await query
    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudyNote[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function updateNote(
  id: string,
  updates: { title?: string; content?: string; tags?: string[]; color?: string; is_pinned?: boolean }
): Promise<ApiResponse<StudyNote>> {
  try {
    const { data, error } = await createClient()
      .from('study_notes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudyNote)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteNote(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient().from('study_notes').delete().eq('id', id)
    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}
