import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

function getAdminClient() {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key = process.env['SUPABASE_SERVICE_ROLE_KEY']
  if (!url || !key) {
    return null
  }
  return createAdminClient(url, key, {
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

    // The caller must be signed in. Without this, anyone could POST an arbitrary
    // userId (and previously an arbitrary role) and get a profile written with the
    // service-role key, which bypasses RLS entirely.
    const supabase = await createServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fullName } = await req.json()

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // userId and role from the request body are deliberately ignored: the id comes
    // from the verified session, and every self-service signup is a student.
    const { error } = await supabaseAdmin.from('profiles').insert({
      user_id: user.id,
      full_name: fullName.trim(),
      email: user.email ?? '',
      role: 'student',
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
