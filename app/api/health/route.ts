// app/api/health/route.ts
// Health check endpoint for monitoring

import { NextResponse } from 'next/server'
import { success } from '@/lib/api/response'
import { APP_VERSION, APP_NAME } from '@/constants/app'

export async function GET(): Promise<NextResponse> {
  const healthData = {
    status: 'healthy',
    service: APP_NAME,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }

  return NextResponse.json(success(healthData))
}

export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 })
}
