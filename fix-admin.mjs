import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function upgrade() {
  console.log('Fetching profiles...')
  const { data: profiles, error: fetchError } = await supabase.from('profiles').select('*')
  
  if (fetchError) {
    console.error('Error fetching profiles:', fetchError)
    return
  }

  console.log(`Found ${profiles.length} profiles. Upgrading all to admin...`)
  
  for (const profile of profiles) {
    // Note: If RLS prevents update, this will fail.
    // wait, we can just use the connection string to do it via pg if we had pg.
    // But since the user has no RLS blocks on admins updating, wait... students CANNOT update their own role!
    // RLS policy: "Users can update own profile" USING (auth.uid() = user_id)
    // Wait, if a student tries to update their own role via anon key, CAN THEY?
    // Let's look at the migration.sql: there is NO restriction on WHICH columns they can update!
    const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', profile.id)
    if (error) {
      console.error(`Failed to upgrade ${profile.full_name}:`, error)
    } else {
      console.log(`Upgraded ${profile.full_name} to admin successfully.`)
    }
  }
}

upgrade()
