import { createClient } from '@/lib/supabase/client'
import type { IPBan, SecurityLog, SecuritySetting, RateLimit } from '@/types/database.types'
import { handleApiError, ApiError } from '@/lib/api/errors'
import type { ApiResponse } from '@/lib/api/response'
import { successResponse } from '@/lib/api/response'

export async function banIP(ipAddress: string, reason: string, expiresAt: string | null = null): Promise<ApiResponse<IPBan>> {
  try {
    const { data: profile } = await createClient()
      .from('profiles')
      .select('id')
      .eq('user_id', (await createClient().auth.getUser()).data.user?.id)
      .single()

    if (!profile) throw new ApiError('Profile not found', 404)

    const { data, error } = await createClient()
      .from('ip_bans')
      .insert({ ip_address: ipAddress, reason, banned_by: profile.id, expires_at: expiresAt })
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as IPBan)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function unbanIP(id: string): Promise<ApiResponse<null>> {
  try {
    const { error } = await createClient().from('ip_bans').delete().eq('id', id)
    if (error) throw new ApiError(error.message, 400)
    return successResponse(null)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getBannedIPs(): Promise<ApiResponse<IPBan[]>> {
  try {
    const { data, error } = await createClient()
      .from('ip_bans')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as IPBan[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getSecurityLogs(limit = 50): Promise<ApiResponse<SecurityLog[]>> {
  try {
    const { data, error } = await createClient()
      .from('security_logs')
      .select('*, user:profiles(full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as SecurityLog[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getSecuritySettings(): Promise<ApiResponse<SecuritySetting[]>> {
  try {
    const { data, error } = await createClient()
      .from('security_settings')
      .select('*')

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as SecuritySetting[])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function updateSecuritySetting(key: string, value: Record<string, unknown>): Promise<ApiResponse<SecuritySetting>> {
  try {
    const { data, error } = await createClient()
      .from('security_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key)
      .select()
      .single()

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as SecuritySetting)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function getRateLimits(): Promise<ApiResponse<RateLimit[]>> {
  try {
    const { data, error } = await createClient()
      .from('rate_limits')
      .select('*')
      .order('request_count', { ascending: false })
      .limit(50)

    if (error) throw new ApiError(error.message, 400)
    return successResponse(data as unknown as RateLimit[])
  } catch (error) {
    return handleApiError(error)
  }
}
