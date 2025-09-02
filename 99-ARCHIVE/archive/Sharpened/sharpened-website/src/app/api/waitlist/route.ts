import { NextRequest, NextResponse } from 'next/server'

interface WaitlistEntry {
  email: string
  variant_id: string
  source: string
  user_segment: string
  timestamp: string
  ip_address?: string
  user_agent?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: WaitlistEntry = await request.json()
    
    // Validate required fields
    if (!body.email || !body.variant_id) {
      return NextResponse.json(
        { error: 'Email and variant_id are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Add metadata
    const enrichedEntry = {
      ...body,
      ip_address: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      created_at: new Date().toISOString()
    }

    // Store in multiple places for redundancy
    const results = await Promise.allSettled([
      // Primary: Supabase (when configured)
      storeInSupabase(enrichedEntry),
      
      // Backup: Local JSON file for development
      storeInLocalFile(enrichedEntry),
      
      // Analytics: Custom event tracking
      trackConversion(enrichedEntry)
    ])

    // Check if at least one storage method succeeded
    const hasSuccess = results.some(result => result.status === 'fulfilled')
    
    if (!hasSuccess) {
      console.error('All storage methods failed:', results)
      return NextResponse.json(
        { error: 'Failed to store waitlist entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully added to waitlist',
      entry_id: generateEntryId(body.email, body.timestamp)
    })

  } catch (error) {
    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function storeInSupabase(entry: WaitlistEntry & { ip_address?: string; user_agent?: string; created_at: string }) {
  // TODO: Implement when Supabase is configured
  // const { createClient } = require('@supabase/supabase-js')
  // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY)
  // return await supabase.from('waitlist').insert(entry)
  
  console.log('Supabase storage (placeholder):', entry)
  return Promise.resolve({ success: true })
}

async function storeInLocalFile(entry: WaitlistEntry & { ip_address?: string; user_agent?: string; created_at: string }) {
  // For development: append to local file
  const fs = require('fs').promises
  const path = require('path')
  
  try {
    const logPath = path.join(process.cwd(), 'waitlist-entries.jsonl')
    const logEntry = JSON.stringify(entry) + '\n'
    await fs.appendFile(logPath, logEntry)
    return { success: true }
  } catch (error) {
    console.error('Local file storage error:', error)
    throw error
  }
}

async function trackConversion(entry: WaitlistEntry & { ip_address?: string; user_agent?: string; created_at: string }) {
  // Custom analytics tracking
  const analyticsData = {
    event: 'waitlist_signup',
    properties: {
      email_domain: entry.email.split('@')[1],
      variant_id: entry.variant_id,
      source: entry.source,
      user_segment: entry.user_segment,
      timestamp: entry.created_at
    }
  }
  
  console.log('Analytics event:', analyticsData)
  return Promise.resolve({ success: true })
}

function generateEntryId(email: string, timestamp: string): string {
  const hash = require('crypto')
    .createHash('md5')
    .update(email + timestamp)
    .digest('hex')
  return hash.substring(0, 8)
}

export async function GET() {
  // Health check endpoint
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
}