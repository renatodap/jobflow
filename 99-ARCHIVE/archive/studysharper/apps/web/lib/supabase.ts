import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

/**
 * Create a Supabase client for use in Client Components
 * This client will automatically handle auth state changes
 */
export const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey
    })
    return null
  }
  
  console.log('Creating Supabase client with URL:', supabaseUrl)
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}


/**
 * Create a basic Supabase client (for general use)
 * Use this when you don't need auth helpers
 */
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

/**
 * Get the current user from the client
 */
export const getCurrentUser = async () => {
  const supabase = createSupabaseClient()
  if (!supabase) return null
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting current user:', error)
    return null
  }
  
  return user
}

/**
 * Get the current session from the client
 */
export const getCurrentSession = async () => {
  const supabase = createSupabaseClient()
  if (!supabase) return null
  
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) {
    console.error('Error getting current session:', error)
    return null
  }
  
  return session
}

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async (redirectTo?: string) => {
  console.log('🔍 signInWithGoogle called with redirectTo:', redirectTo)
  
  const supabase = createSupabaseClient()
  if (!supabase) {
    console.error('❌ Supabase client not available')
    throw new Error('Supabase client not available')
  }
  
  const callbackUrl = `${window.location.origin}/auth/callback`
  const finalRedirectTo = redirectTo ? `${callbackUrl}?redirect_to=${encodeURIComponent(redirectTo)}` : callbackUrl
  console.log('🔗 Using callback URL:', finalRedirectTo)
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: finalRedirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  
  if (error) {
    console.error('❌ Google OAuth error:', error)
    throw error
  }
  
  console.log('✅ Google OAuth initiated:', data)
  return data
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string, fullName: string) => {
  console.log('🔍 signUpWithEmail called:', { email, fullName })
  
  const supabase = createSupabaseClient()
  if (!supabase) {
    console.error('❌ Supabase client not available for signup')
    throw new Error('Supabase client not available')
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: fullName,
      }
    }
  })
  
  if (error) {
    console.error('❌ Email signup error:', error)
    throw error
  }
  
  console.log('✅ Email signup success:', data)
  return data
}

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  console.log('🔍 signInWithEmail called:', { email })
  
  const supabase = createSupabaseClient()
  if (!supabase) {
    console.error('❌ Supabase client not available for signin')
    throw new Error('Supabase client not available')
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    console.error('❌ Email signin error:', error)
    throw error
  }
  
  console.log('✅ Email signin success:', data)
  return data
}

/**
 * Reset password
 */
export const resetPassword = async (email: string) => {
  const supabase = createSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')
  
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })
  
  if (error) {
    console.error('Error resetting password:', error)
    throw error
  }
  
  return data
}

/**
 * Resend confirmation email
 */
export const resendConfirmation = async (email: string) => {
  console.log('🔍 resendConfirmation called:', { email })
  
  const supabase = createSupabaseClient()
  if (!supabase) {
    console.error('❌ Supabase client not available for resend confirmation')
    throw new Error('Supabase client not available')
  }
  
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    }
  })
  
  if (error) {
    console.error('❌ Resend confirmation error:', error)
    throw error
  }
  
  console.log('✅ Confirmation email resent:', data)
  return data
}

/**
 * Update password
 */
export const updatePassword = async (password: string) => {
  const supabase = createSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')
  
  const { data, error } = await supabase.auth.updateUser({
    password,
  })
  
  if (error) {
    console.error('Error updating password:', error)
    throw error
  }
  
  return data
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const supabase = createSupabaseClient()
  if (!supabase) throw new Error('Supabase client not available')
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const user = await getCurrentUser()
  return !!user
}

/**
 * Auth state change listener
 */
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  const supabase = createSupabaseClient()
  if (!supabase) return { data: { subscription: null }, unsubscribe: () => {} }
  
  return supabase.auth.onAuthStateChange(callback)
}

/**
 * Utility function to handle auth errors
 */
export const handleAuthError = (error: any): string => {
  if (error?.message) {
    // Common auth error messages that can be made user-friendly
    const message = error.message.toLowerCase()
    
    if (message.includes('invalid login credentials')) {
      return 'Invalid email or password. Please try again.'
    }
    
    if (message.includes('email not confirmed')) {
      return 'Please check your email and click the confirmation link.'
    }
    
    if (message.includes('signup disabled')) {
      return 'Account registration is currently disabled.'
    }
    
    if (message.includes('email already registered')) {
      return 'An account with this email already exists.'
    }
    
    if (message.includes('password should be at least')) {
      return 'Password should be at least 6 characters long.'
    }
    
    return error.message
  }
  
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Types for better TypeScript support
 */
export type SupabaseClient = ReturnType<typeof createSupabaseClient>