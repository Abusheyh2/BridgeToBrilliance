// constants/app.ts
// Application-wide constants

export const APP_NAME = 'Bridge to Brilliance'
export const APP_SHORT_NAME = 'BTB'
export const APP_DESCRIPTION = 'Connect teachers, students, and learning'
export const APP_VERSION = '1.0.0'

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.TEACHER]: 'Teacher',
  [UserRole.STUDENT]: 'Student',
}

export const PROTECTED_ROUTES = ['/dashboard', '/subjects']
export const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/']
export const ROLE_BASED_DASHBOARDS: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/dashboard/admin',
  [UserRole.TEACHER]: '/dashboard/teacher',
  [UserRole.STUDENT]: '/dashboard/student',
}

// HTTP status codes for consistency
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const

// Cache durations (in seconds)
export const CACHE_DURATION = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 1 day
} as const
