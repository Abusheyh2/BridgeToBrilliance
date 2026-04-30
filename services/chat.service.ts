import { createClient } from '@/lib/supabase/client'
import type { ChatMessage } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function sendMessage(
  groupId: string,
  content: string,
  attachmentUrl: string | null = null,
  attachmentType: string | null = null,
  replyTo: string | null = null
): Promise<ApiResponse<ChatMessage>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('chat_messages')
      .insert({
        group_id: groupId,
        sender_id: profile.id,
        content,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
        reply_to: replyTo,
      })
      .select('*, sender:profiles(full_name, avatar_url)')
      .single()

    if (error) throw new ApiError(error.message, 400)

    return successResponse(data as unknown as ChatMessage)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getMessages(
  groupId: string,
  limit = 50,
  before?: string
): Promise<ApiResponse<ChatMessage[]>> {
  try {
    let query = createClient()
      .from('chat_messages')
      .select('*, sender:profiles(full_name, avatar_url)')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (before) {
      query = query.lt('created_at', before)
    }

    const { data, error } = await query
    if (error) throw new ApiError(error.message, 400)

    return successResponse((data as unknown as ChatMessage[]).reverse())
  } catch (error) {
    return handleApiError(error)
  }
}

export async function deleteMessage(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient().from('chat_messages').delete().eq('id', id)
    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}
