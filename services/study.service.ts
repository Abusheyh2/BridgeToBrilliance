import { createClient } from '@/lib/supabase/client'
import type { Bookmark, StudyPlan, StudyPlanTask, Achievement, UserAchievement } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function createBookmark(
  title: string,
  lessonId: string | null,
  subjectId: string | null,
  url: string | null,
  notes: string | null
): Promise<ApiResponse<Bookmark>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('bookmarks')
      .insert({
        student_id: profile.id,
        title,
        lesson_id: lessonId,
        subject_id: subjectId,
        url,
        notes,
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as Bookmark)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getBookmarks(params?: { subjectId?: string }): Promise<ApiResponse<Bookmark[]>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    let query = createClient()
      .from('bookmarks')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })

    if (params?.subjectId) {
      query = query.eq('subject_id', params.subjectId)
    }

    const { data, error } = await query
    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as Bookmark[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteBookmark(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient().from('bookmarks').delete().eq('id', id)
    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function createPlan(
  title: string,
  description: string,
  startDate: string,
  endDate: string,
  goals: string[]
): Promise<ApiResponse<StudyPlan>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('study_plans')
      .insert({
        student_id: profile.id,
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        goals,
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudyPlan)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getPlans(): Promise<ApiResponse<StudyPlan[]>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('study_plans')
      .select('*')
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudyPlan[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getPlanTasks(planId: string): Promise<ApiResponse<StudyPlanTask[]>> {
  try {
    const { data, error } = await createClient()
      .from('study_plan_tasks')
      .select('*')
      .eq('plan_id', planId)
      .order('order_index', { ascending: true })

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudyPlanTask[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function addPlanTask(
  planId: string,
  title: string,
  description: string,
  subjectId: string | null,
  dueDate: string | null,
  priority: string,
  orderIndex: number
): Promise<ApiResponse<StudyPlanTask>> {
  try {
    const { data, error } = await createClient()
      .from('study_plan_tasks')
      .insert({
        plan_id: planId,
        title,
        description,
        subject_id: subjectId,
        due_date: dueDate,
        priority,
        order_index: orderIndex,
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as StudyPlanTask)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function toggleTaskCompleted(id: string): Promise<ApiResponse<StudyPlanTask>> {
  try {
    const { data, error } = await createClient()
      .from('study_plan_tasks')
      .select('is_completed')
      .eq('id', id)
      .single()

    if (error) throw new ApiError(error.message, 400)

    const task = data as unknown as StudyPlanTask
    const { data: updated, error: updateError } = await createClient()
      .from('study_plan_tasks')
      .update({ is_completed: !task.is_completed })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new ApiError(updateError.message, 400)
    return successResponse(updated as unknown as StudyPlanTask)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deletePlan(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient().from('study_plans').delete().eq('id', id)
    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getAchievements(): Promise<ApiResponse<UserAchievement[]>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('user_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('student_id', profile.id)
      .order('unlocked_at', { ascending: false })

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as UserAchievement[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getAllAchievements(): Promise<ApiResponse<Achievement[]>> {
  try {
    const { data, error } = await createClient()
      .from('achievements')
      .select('*')
      .order('category', { ascending: true })

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as Achievement[])
  } catch (error) {
    return handleApiError(error)
  }
}
