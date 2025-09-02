import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CreateTermData, Term } from '@/types/academic'

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

export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 })
    }

    // Verify school ownership first
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id')
      .eq('id', schoolId)
      .eq('user_id', session.user.id)
      .single()

    if (schoolError || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    const { data: terms, error } = await supabase
      .from('terms')
      .select('*')
      .eq('school_id', schoolId)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch terms' }, { status: 500 })
    }

    return NextResponse.json({ terms })

  } catch (error) {
    console.error('Terms fetch error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, start_date, end_date, active, school_id } = await request.json()

    if (!name || !start_date || !end_date || !school_id) {
      return NextResponse.json({ 
        error: 'Name, start date, end date, and school ID are required' 
      }, { status: 400 })
    }

    // Verify school ownership
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id')
      .eq('id', school_id)
      .eq('user_id', session.user.id)
      .single()

    if (schoolError || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // If this term is being set as active, deactivate other terms
    if (active) {
      await supabase
        .from('terms')
        .update({ active: false })
        .eq('school_id', school_id)
    }

    const { data: term, error } = await supabase
      .from('terms')
      .insert({
        school_id,
        name: name.trim(),
        start_date,
        end_date,
        active: !!active
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create term' }, { status: 500 })
    }

    return NextResponse.json({ success: true, term })

  } catch (error) {
    console.error('Term creation error:', error)
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

    const { id, name, start_date, end_date, active } = await request.json()

    if (!id || !name || !start_date || !end_date) {
      return NextResponse.json({ 
        error: 'ID, name, start date, and end date are required' 
      }, { status: 400 })
    }

    // Verify ownership through school
    const { data: existingTerm, error: checkError } = await supabase
      .from('terms')
      .select(`
        id,
        school_id,
        schools!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (checkError || !existingTerm || (existingTerm.schools as any).user_id !== session.user.id) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    // If this term is being set as active, deactivate other terms in the same school
    if (active) {
      await supabase
        .from('terms')
        .update({ active: false })
        .eq('school_id', existingTerm.school_id)
        .neq('id', id)
    }

    const { data: term, error } = await supabase
      .from('terms')
      .update({
        name: name.trim(),
        start_date,
        end_date,
        active: !!active
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update term' }, { status: 500 })
    }

    return NextResponse.json({ success: true, term })

  } catch (error) {
    console.error('Term update error:', error)
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
      return NextResponse.json({ error: 'Term ID is required' }, { status: 400 })
    }

    // Verify ownership through school before deletion
    const { data: existingTerm, error: checkError } = await supabase
      .from('terms')
      .select(`
        id,
        schools!inner(user_id)
      `)
      .eq('id', id)
      .single()

    if (checkError || !existingTerm || (existingTerm.schools as any).user_id !== session.user.id) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    const { error } = await supabase
      .from('terms')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete term' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Term deletion error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}