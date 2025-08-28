import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, phone, location } = await request.json()
    
    // Validate required fields
    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      )
    }
    
    // Create Supabase client
    const supabase = createRouteHandlerClient()
    
    // Sign up user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone,
          location
        }
      }
    })
    
    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }
    
    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 400 }
      )
    }
    
    // Update profile with additional information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name,
        phone,
        location
      })
      .eq('id', authData.user.id)
    
    if (profileError) {
      console.error('Profile update error:', profileError)
    }
    
    // Return success response with session
    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Pending admin approval.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name,
        approved: false
      },
      session: authData.session
    })
    
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}