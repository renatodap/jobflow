import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    
    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    // Get admin client for full access
    const adminSupabase = createAdminClient()
    
    // Approve the user
    const { data: approvedUser, error: approveError } = await adminSupabase
      .from('profiles')
      .update({
        approved: true,
        subscription_status: 'trial', // Start with trial
        trial_ends_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
        searches_remaining: 5,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.userId)
      .select()
      .single()
    
    if (approveError) {
      console.error('Error approving user:', approveError)
      return NextResponse.json(
        { error: 'Failed to approve user' },
        { status: 500 }
      )
    }
    
    // Log admin activity
    await adminSupabase
      .from('admin_activities')
      .insert({
        admin_id: user.id,
        action: 'approve_user',
        target_user_id: params.userId,
        details: {
          approved_at: new Date().toISOString(),
          trial_days: 3
        }
      })
    
    // TODO: Send welcome email to approved user
    // This would trigger the email service to send a welcome email
    
    return NextResponse.json({
      success: true,
      message: 'User approved successfully',
      user: approvedUser
    })
    
  } catch (error) {
    console.error('User approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}