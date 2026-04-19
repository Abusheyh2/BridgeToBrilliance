// services/profile.service.ts
// User profile business logic

import { createClient } from '@/lib/supabase/client'
import { NotFoundError, ValidationError } from '@/lib/api/errors'

export interface UserProfile {
  id: string
  userId: string
  fullName: string
  email: string
  role: 'student' | 'teacher' | 'admin'
  avatar?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

class ProfileService {
  private supabase = createClient()

  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      throw new NotFoundError('User profile')
    }

    return this.mapProfileData(data)
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (updates.fullName && updates.fullName.length < 2) {
      throw new ValidationError('Full name must be at least 2 characters')
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .update({
        full_name: updates.fullName,
        bio: updates.bio,
        avatar: updates.avatar,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !data) {
      throw new Error('Failed to update profile')
    }

    return this.mapProfileData(data)
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('full_name', username)
      .single()

    return !data && !error
  }

  /**
   * Map database profile to application model
   */
  private mapProfileData(data: any): UserProfile {
    return {
      id: data.id,
      userId: data.user_id,
      fullName: data.full_name,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      bio: data.bio,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }
}

export const profileService = new ProfileService()
