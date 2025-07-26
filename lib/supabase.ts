import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Types for our database schema
export interface UserProfile {
  id: string
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  first_name?: string
  last_name?: string
  company_name?: string
  website_url?: string
  email: string
  business_type?: string
  business_description?: string
  marketing_location?: string
  city?: string
  country?: string
  ghl_contact_id?: string
  user_id?: string
  created_at: string
}

export interface GeneratedScript {
  id: string
  lead_id: string
  title: string
  script_body: string
  order_index: number
  created_at: string
}

// Helper function to check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return data.is_admin
}

// Helper function to get current user profile
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.log('No authenticated user found')
    return null
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}