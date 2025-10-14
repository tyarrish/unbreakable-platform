import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  // If not logged in, redirect to login page
  redirect(session ? '/dashboard' : '/login')
}
