// lib/api/errors.ts
// Centralized error handling

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string = 'API_ERROR',
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', 400, message, details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super('NOT_FOUND', 404, `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', 401, message)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', 403, message)
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFLICT', 409, message, details)
    this.name = 'ConflictError'
  }
}

export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error', details?: Record<string, unknown>) {
    super('INTERNAL_SERVER_ERROR', 500, message, details)
    this.name = 'InternalServerError'
  }
}

export function getStatusCode(error: Error): number {
  if (error instanceof ApiError) {
    return error.statusCode
  }
  return 500
}

export function getErrorResponse(error: Error) {
  if (error instanceof ApiError) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
    }
  }

  return {
    code: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : error.message,
  }
}

export function handleApiError(error: unknown): { success: false; data: undefined; error: { code: string; message: string } } {
  if (error instanceof ApiError) {
    return { success: false, data: undefined, error: { code: error.code, message: error.message } }
  }
  if (error instanceof Error) {
    return { success: false, data: undefined, error: { code: 'UNKNOWN_ERROR', message: error.message } }
  }
  return { success: false, data: undefined, error: { code: 'UNKNOWN_ERROR', message: 'An unexpected error occurred' } }
}
