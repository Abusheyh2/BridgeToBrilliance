import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

function getAdminClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!url || !key) {
    return null
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = getAdminClient()
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server not configured. Add SUPABASE_SERVICE_ROLE_KEY to env vars.' },
        { status: 500 }
      )
    }

    const { userId, fullName, email, role } = await req.json()

    if (!userId || !fullName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabaseAdmin.from('profiles').insert({
      user_id: userId,
      full_name: fullName,
      email: email || '',
      role: role || 'student',
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
