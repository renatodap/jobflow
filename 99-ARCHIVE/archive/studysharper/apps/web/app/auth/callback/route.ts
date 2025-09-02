import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to')?.toString()

  console.log('🔍 Auth callback called:', {
    code: code ? 'present' : 'missing',
    origin,
    redirectTo,
    fullUrl: request.url
  })

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    try {
      console.log('🔍 Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }
      
      console.log('✅ Auth callback success:', data.user?.email)
    } catch (error) {
      console.error('❌ Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(String(error))}`)
    }
  } else {
    console.log('⚠️ No auth code provided')
  }

  // URL to redirect to after sign up process completes
  const redirectUrl = redirectTo || `${origin}/dashboard`
  console.log('🔗 Redirecting to:', redirectUrl)
  return NextResponse.redirect(redirectUrl)
}