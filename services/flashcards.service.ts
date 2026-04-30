import { createClient } from '@/lib/supabase/client'
import type { FlashcardDeck, Flashcard, FlashcardProgress } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function createDeck(
  title: string,
  description: string,
  subjectId: string | null,
  isPublic: boolean
): Promise<ApiResponse<FlashcardDeck>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('flashcard_decks')
      .insert({ title, description, subject_id: subjectId, created_by: profile.id, is_public: isPublic })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as FlashcardDeck)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getDecks(params?: { subjectId?: string }): Promise<ApiResponse<FlashcardDeck[]>> {
  try {
    let query = createClient()
      .from('flashcard_decks')
      .select('*, creator:profiles!flashcard_decks_created_by_fkey(full_name, avatar_url)')
      .order('created_at', { ascending: false })

    if (params?.subjectId) {
      query = query.eq('subject_id', params.subjectId)
    }

    const { data, error } = await query
    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as FlashcardDeck[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getDeck(id: string): Promise<ApiResponse<FlashcardDeck & { cards: Flashcard[] }>> {
  try {
    const { data, error } = await createClient()
      .from('flashcard_decks')
      .select('*, cards:flashcards(*)')
      .eq('id', id)
      .single()

    if (error) throw new ApiError(error.message, 404)
    return successResponse(data as unknown as FlashcardDeck & { cards: Flashcard[] })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function addCard(
  deckId: string,
  front: string,
  back: string,
  orderIndex: number
): Promise<ApiResponse<Flashcard>> {
  try {
    const { data, error } = await createClient()
      .from('flashcards')
      .insert({ deck_id: deckId, front, back, order_index: orderIndex })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as Flashcard)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function updateCardProgress(
  flashcardId: string,
  masteryLevel: number
): Promise<ApiResponse<FlashcardProgress>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const now = new Date().toISOString()
    const nextReview = new Date(Date.now() + masteryLevel * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await createClient()
      .from('flashcard_progress')
      .upsert({
        student_id: profile.id,
        flashcard_id: flashcardId,
        mastery_level: masteryLevel,
        last_reviewed: now,
        next_review: nextReview,
        review_count: 1,
      }, { onConflict: 'student_id,flashcard_id' })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as FlashcardProgress)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteDeck(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient().from('flashcard_decks').delete().eq('id', id)
    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}
