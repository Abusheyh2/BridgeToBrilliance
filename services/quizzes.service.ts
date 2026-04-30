import { createClient } from '@/lib/supabase/client'
import type { Quiz, QuizQuestion, QuizAttempt } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function createQuiz(
  title: string,
  description: string,
  subjectId: string | null,
  timeLimitSeconds: number | null,
  passingScore: number,
  isPublic: boolean
): Promise<ApiResponse<Quiz>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('quizzes')
      .insert({
        title,
        description,
        subject_id: subjectId,
        created_by: profile.id,
        time_limit_seconds: timeLimitSeconds,
        passing_score: passingScore,
        is_public: isPublic,
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as Quiz)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getQuizzes(params?: { subjectId?: string }): Promise<ApiResponse<Quiz[]>> {
  try {
    let query = createClient()
      .from('quizzes')
      .select('*, creator:profiles!quizzes_created_by_fkey(full_name, avatar_url)')
      .order('created_at', { ascending: false })

    if (params?.subjectId) {
      query = query.eq('subject_id', params.subjectId)
    }

    const { data, error } = await query
    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as Quiz[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getQuiz(id: string): Promise<ApiResponse<Quiz & { questions: QuizQuestion[] }>> {
  try {
    const { data, error } = await createClient()
      .from('quizzes')
      .select('*, questions:quiz_questions(*)')
      .eq('id', id)
      .single()

    if (error) throw new ApiError(error.message, 404)
    return successResponse(data as unknown as Quiz & { questions: QuizQuestion[] })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function addQuestion(
  quizId: string,
  question: string,
  questionType: string,
  options: Record<string, unknown>[] | null,
  correctAnswer: string,
  explanation: string | null,
  points: number,
  orderIndex: number
): Promise<ApiResponse<QuizQuestion>> {
  try {
    const { data, error } = await createClient()
      .from('quiz_questions')
      .insert({
        quiz_id: quizId,
        question,
        question_type: questionType,
        options,
        correct_answer: correctAnswer,
        explanation,
        points,
        order_index: orderIndex,
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as QuizQuestion)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function submitQuizAttempt(
  quizId: string,
  answers: Record<string, unknown>,
  score: number,
  totalPoints: number
): Promise<ApiResponse<QuizAttempt>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        student_id: profile.id,
        answers,
        score,
        total_points: totalPoints,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as QuizAttempt)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getMyAttempts(quizId: string): Promise<ApiResponse<QuizAttempt[]>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', quizId)
      .eq('student_id', profile.id)
      .order('created_at', { ascending: false })

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as QuizAttempt[])
  } catch (error) {
    return handleApiError(error)
  }
}
