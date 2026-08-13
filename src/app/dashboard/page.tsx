import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get user profile with school
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userProfile) redirect('/auth/login')

  // Get school
  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('id', userProfile.school_id)
    .single()

  // Get trackers for this school
  const { data: trackers } = await supabase
    .from('trackers')
    .select('*')
    .eq('school_id', userProfile.school_id)
    .order('created_at', { ascending: true })

  return (
    <DashboardClient
      user={user}
      userProfile={userProfile}
      school={school}
      initialTrackers={trackers || []}
    />
  )
}
