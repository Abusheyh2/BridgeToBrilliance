// lib/api/middleware.ts
// API middleware utilities for request/response handling

import type { NextRequest } from 'next/server'
import { ApiError, getErrorResponse, getStatusCode } from './errors'
import { error } from './response'

/**
 * Wrap API route handlers with error handling
 */
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<Response>
) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      return await handler(req)
    } catch (err) {
      const status = getStatusCode(err as Error)
      const errorData = getErrorResponse(err as Error)

      return Response.json(error(errorData.code, errorData.message, errorData.details), {
        status,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
  }
}

/**
 * Verify user authentication in API routes
 */
export async function verifyAuth(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError('Missing or invalid authorization header', 401, 'UNAUTHORIZED')
  }

  const token = authHeader.slice(7)
  // Token validation would go here with Supabase
  return token
}

/**
 * Parse and validate request body
 */
export async function parseRequestBody<T>(
  req: NextRequest,
  schema: (data: unknown) => T | Promise<T>
): Promise<T> {
  try {
    const body = await req.json()
    return await schema(body)
  } catch (err) {
    throw new ApiError(
      'Invalid request body',
      400,
      'INVALID_REQUEST',
      { error: err instanceof Error ? err.message : undefined }
    )
  }
}

/**
 * Set CORS headers.
 *
 * DO NOT allow `*` while advertising `Authorization`: that lets any origin drive
 * the API with a user's credentials. Pass the single trusted origin instead.
 */
export function setCorsHeaders(response: Response, allowedOrigin: string): Response {
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
  response.headers.set('Vary', 'Origin')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}
