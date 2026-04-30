import { createClient } from '@/lib/supabase/client'
import type { Profile, TeacherAssignment } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function getAllUsers(): Promise<ApiResponse<Profile[]>> {
  try {
    const { data, error } = await createClient()
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as Profile[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function updateUserRole(userId: string, role: 'student' | 'teacher' | 'admin'): Promise<ApiResponse<Profile>> {
  try {
    const { data, error } = await createClient()
      .from('profiles')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as Profile)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function banUser(userId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient()
      .from('profiles')
      .update({ is_banned: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function unbanUser(userId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient()
      .from('profiles')
      .update({ is_banned: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteUser(userId: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient()
      .from('profiles')
      .delete()
      .eq('user_id', userId)

    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function assignTeacherToSubject(teacherId: string, subjectId: string, isPrimary = false): Promise<ApiResponse<TeacherAssignment>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('teacher_assignments')
      .insert({ teacher_id: teacherId, subject_id: subjectId, assigned_by: profile.id, is_primary: isPrimary })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as TeacherAssignment)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function removeTeacherAssignment(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient().from('teacher_assignments').delete().eq('id', id)
    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getTeacherAssignments(teacherId: string): Promise<ApiResponse<TeacherAssignment[]>> {
  try {
    const { data, error } = await createClient()
      .from('teacher_assignments')
      .select('*, subject:subjects(title, icon)')
      .eq('teacher_id', teacherId)

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as TeacherAssignment[])
  } catch (error) {
    return handleApiError(error)
  }
}
