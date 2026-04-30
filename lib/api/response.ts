// lib/api/response.ts
// Standardized API response utilities

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    timestamp: string
    version: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Create a successful API response
 */
export function success<T>(data: T, meta?: Record<string, unknown>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
      ...meta,
    },
  }
}

/**
 * Create an error API response
 */
export function error(
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0',
    },
  }
}

/**
 * Create a paginated response
 */
export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total,
  }
}

export function successResponse<T>(data: T): { success: true; data: T } {
  return { success: true, data }
}
