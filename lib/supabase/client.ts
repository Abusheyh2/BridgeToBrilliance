import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function isSupabaseConfigured(): boolean {
  const url = process.env['NEXT_PUBLIC_SUPABASE_URL']
  const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']
  return Boolean(
    url &&
    key &&
    !url.includes('your-project-id') &&
    !url.includes('mock-project') &&
    !key.includes('your-anon-key') &&
    !key.includes('mock-anon-key')
  )
}

export function createClient() {
  if (client) return client

  const url = process.env['NEXT_PUBLIC_SUPABASE_URL'] || 'https://mock-project.supabase.co'
  const key = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.mock-key'

  client = createBrowserClient(url, key)
  return client
}
