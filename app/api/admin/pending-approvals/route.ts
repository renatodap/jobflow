import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient, createAdminClient } from '@/lib/supabase/server'

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
    
    // Get pending users (not approved)
    const { data: pendingUsers, error: pendingError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false })
    
    if (pendingError) {
      console.error('Error fetching pending users:', pendingError)
      return NextResponse.json(
        { error: 'Failed to fetch pending users' },
        { status: 500 }
      )
    }
    
    // Get statistics
    const { count: totalUsers } = await adminSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    
    const { count: activeUsers } = await adminSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
    
    // Calculate monthly revenue (simple: active users × $15)
    const monthlyRevenue = (activeUsers || 0) * 15
    
    // Get approved count this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const { count: approvedThisMonth } = await adminSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true)
      .gte('updated_at', startOfMonth.toISOString())
    
    return NextResponse.json({
      pending_users: pendingUsers || [],
      total_users: totalUsers || 0,
      monthly_revenue: monthlyRevenue,
      approved_this_month: approvedThisMonth || 0,
      active_users: activeUsers || 0
    })
    
  } catch (error) {
    console.error('Admin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}