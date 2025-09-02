import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    // Create admin client with service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // List all users
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      console.error('Error listing users:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return relevant user information
    const users = data.users.map(user => ({
      id: user.id,
      email: user.email,
      email_confirmed_at: user.email_confirmed_at,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      confirmed: !!user.email_confirmed_at
    }))

    return NextResponse.json({ users })

  } catch (error) {
    console.error('List users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}