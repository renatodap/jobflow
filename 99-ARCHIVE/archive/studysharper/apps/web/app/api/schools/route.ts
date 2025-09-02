import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CreateSchoolData, School } from '@/types/academic'

function createSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

export async function GET() {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: schools, error } = await supabase
      .from('schools')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch schools' }, { status: 500 })
    }

    return NextResponse.json({ schools })

  } catch (error) {
    console.error('Schools fetch error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    // Check authentication
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, type, userId } = await request.json()

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const { data: school, error } = await supabase
      .from('schools')
      .insert({
        user_id: session.user.id,
        name: name.trim(),
        type
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create school' }, { status: 500 })
    }

    return NextResponse.json({ success: true, school })

  } catch (error) {
    console.error('School creation error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name, type, userId } = await request.json()

    if (!id || !name || !type) {
      return NextResponse.json({ error: 'ID, name and type are required' }, { status: 400 })
    }

    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Verify ownership
    const { data: existingSchool, error: checkError } = await supabase
      .from('schools')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (checkError || !existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const { data: school, error } = await supabase
      .from('schools')
      .update({
        name: name.trim(),
        type
      })
      .eq('id', id)
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update school' }, { status: 500 })
    }

    return NextResponse.json({ success: true, school })

  } catch (error) {
    console.error('School update error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    // Verify ownership before deletion
    const { data: existingSchool, error: checkError } = await supabase
      .from('schools')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .single()

    if (checkError || !existingSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete school' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('School deletion error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}