import { createClient } from '@/lib/supabase/client'
import type { StudyGroup, StudyGroupMember } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function createGroup(
  name: string,
  description: string,
  icon: string,
  color: string,
  subjectId: string | null,
  isPublic: boolean,
  maxMembers: number
): Promise<ApiResponse<StudyGroup>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('study_groups')
      .insert({
        name,
        description,
        icon,
        color,
        created_by: profile.id,
        subject_id: subjectId,
        is_public: isPublic,
        max_members: maxMembers,
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)

    return successResponse(data)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getGroups(params?: {
  subjectId?: string
  isPublic?: boolean
}): Promise<ApiResponse<StudyGroup[]>> {
  try {
    let query = createClient()
      .from('study_groups')
      .select('*, creator:profiles!study_groups_created_by_fkey(full_name, avatar_url)')
      .order('created_at', { ascending: false })

    if (params?.subjectId) {
      query = query.eq('subject_id', params.subjectId)
    }
    if (params?.isPublic !== undefined) {
      query = query.eq('is_public', params.isPublic)
    }

    const { data, error } = await query
    if (error) throw new ApiError(error.message, 400)

    return successResponse(data as unknown as StudyGroup[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getGroup(id: string): Promise<ApiResponse<StudyGroup & { members: StudyGroupMember[] }>> {
  try {
    const { data, error } = await createClient()
      .from('study_groups')
      .select(`
        *,
        creator:profiles!study_groups_created_by_fkey(full_name, avatar_url),
        members:study_group_members(
          *,
          student:profiles(full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw new ApiError(error.message, 404)

    return successResponse(data as unknown as StudyGroup & { members: StudyGroupMember[] })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function joinGroup(groupId: string): Promise<ApiResponse<StudyGroupMember>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('study_group_members')
      .insert({ group_id: groupId, student_id: profile.id, role: 'member' })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)

    return successResponse(data as unknown as StudyGroupMember)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function leaveGroup(groupId: string): Promise<ApiResponse<null>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { error } = await createClient()
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('student_id', profile.id)

    if (error) throw new ApiError(error.message, 400)

    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteGroup(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient().from('study_groups').delete().eq('id', id)
    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getMyGroups(): Promise<ApiResponse<StudyGroup[]>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('study_group_members')
      .select(`
        study_groups(
          *,
          creator:profiles!study_groups_created_by_fkey(full_name, avatar_url)
        )
      `)
      .eq('student_id', profile.id)
      .order('joined_at', { ascending: false })

    if (error) throw new ApiError(error.message, 400)

    const groups = (data as unknown as Array<{ study_groups: StudyGroup }>)?.map(d => d.study_groups) ?? []
    return successResponse(groups)
  } catch (error) {
    return handleApiError(error)
  }
}
