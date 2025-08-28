import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createRouteHandlerClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get user search settings
    let { data: settings, error: settingsError } = await supabase
      .from('search_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    // If no settings exist, create default settings
    if (!settings) {
      const { data: newSettings, error: createError } = await supabase
        .from('search_settings')
        .insert({
          user_id: user.id,
          job_titles: [],
          locations: [],
          min_salary: 0,
          max_salary: null,
          remote_only: false,
          job_types: ['full-time'],
          email_frequency: 'daily',
          max_jobs_per_email: 20,
          include_resume: true,
          include_cover_letter: true,
          exclude_companies: []
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Settings creation error:', createError)
        return NextResponse.json(
          { error: 'Failed to create settings' },
          { status: 500 }
        )
      }
      
      settings = newSettings
    }
    
    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Settings API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Create Supabase client
    const supabase = createRouteHandlerClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Allowed fields to update
    const allowedFields = [
      'job_titles', 'locations', 'min_salary', 'max_salary',
      'remote_only', 'job_types', 'email_frequency', 'max_jobs_per_email',
      'include_resume', 'include_cover_letter', 'exclude_companies'
    ]
    
    // Filter body to only include allowed fields
    const updateData: any = {}
    for (const key of allowedFields) {
      if (key in body) {
        updateData[key] = body[key]
      }
    }
    
    // Check if settings exist
    const { data: existingSettings } = await supabase
      .from('search_settings')
      .select('id')
      .eq('user_id', user.id)
      .single()
    
    let updatedSettings
    
    if (existingSettings) {
      // Update existing settings
      const { data, error: updateError } = await supabase
        .from('search_settings')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single()
      
      if (updateError) {
        console.error('Settings update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update settings' },
          { status: 500 }
        )
      }
      
      updatedSettings = data
    } else {
      // Create new settings
      const { data, error: createError } = await supabase
        .from('search_settings')
        .insert({
          user_id: user.id,
          ...updateData
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Settings creation error:', createError)
        return NextResponse.json(
          { error: 'Failed to create settings' },
          { status: 500 }
        )
      }
      
      updatedSettings = data
    }
    
    return NextResponse.json({
      success: true,
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Settings update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}