import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

// Server-side Supabase client for API routes
export function createRouteHandlerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}

// Admin client with service role for admin operations
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

// Database types
export interface Profile {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  location: string | null
  linkedin: string | null
  github: string | null
  website: string | null
  approved: boolean
  is_admin: boolean
  subscription_status: 'trial' | 'active' | 'expired' | 'cancelled'
  subscription_start_date: string | null
  subscription_end_date: string | null
  trial_ends_at: string
  searches_remaining: number
  search_active: boolean
  created_at: string
  updated_at: string
}

export interface SearchSettings {
  id: string
  user_id: string
  job_titles: string[]
  locations: string[]
  min_salary: number
  max_salary: number | null
  remote_only: boolean
  job_types: string[]
  email_frequency: 'daily' | 'twice_daily' | 'weekly'
  max_jobs_per_email: number
  include_resume: boolean
  include_cover_letter: boolean
  exclude_companies: string[]
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  job_hash: string
  title: string
  company: string
  location: string | null
  salary_min: number | null
  salary_max: number | null
  description: string | null
  requirements: string[]
  url: string | null
  source: string
  contract_type: string | null
  category: string | null
  days_old: number | null
  score: number
  discovered_at: string
  last_seen_at: string
}

export interface Application {
  id: string
  user_id: string
  job_id: string
  status: 'new' | 'viewed' | 'applied' | 'interviewing' | 'rejected' | 'offer' | 'accepted'
  applied_at: string | null
  resume_version: string | null
  cover_letter_generated: boolean
  notes: string | null
  response_received: boolean
  response_date: string | null
  created_at: string
  updated_at: string
}