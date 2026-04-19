// types/common.ts
// Common TypeScript types used across the application

/**
 * Paginated list response
 */
export interface PagedList<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Request options for API calls
 */
export interface RequestOptions {
  signal?: AbortSignal
  timeout?: number
  retries?: number
}

/**
 * API request state
 */
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Route metadata
 */
export interface RouteMetadata {
  title: string
  description: string
  requiresAuth: boolean
  roles?: string[]
}

/**
 * User roles in the application
 */
export type UserRole = 'admin' | 'teacher' | 'student'

/**
 * Status enum for resources
 */
export enum Status {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
}

/**
 * Generic callback function
 */
export type Callback<T> = (data: T) => void

/**
 * Generic async result
 */
export type Result<T, E = Error> = { ok: true; data: T } | { ok: false; error: E }
