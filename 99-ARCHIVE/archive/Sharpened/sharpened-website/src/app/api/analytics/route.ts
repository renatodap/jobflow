import { NextRequest, NextResponse } from 'next/server'

interface AnalyticsEvent {
  event: string
  properties: Record<string, any>
  user_id?: string
  session_id?: string
  timestamp?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: AnalyticsEvent = await request.json()
    
    if (!body.event) {
      return NextResponse.json(
        { error: 'Event name is required' },
        { status: 400 }
      )
    }

    // Enrich event with metadata
    const enrichedEvent = {
      ...body,
      timestamp: body.timestamp || new Date().toISOString(),
      ip_address: request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      referer: request.headers.get('referer') || 'direct'
    }

    // Send to multiple analytics services
    await Promise.allSettled([
      sendToCustomAnalytics(enrichedEvent),
      sendToGoogleAnalytics(enrichedEvent),
      logToFile(enrichedEvent)
    ])

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}

async function sendToCustomAnalytics(event: any) {
  // Custom analytics implementation
  console.log('Custom Analytics:', event)
  
  // Calculate conversion metrics
  if (event.event === 'waitlist_signup') {
    await updateConversionMetrics(event)
  }
  
  return Promise.resolve({ success: true })
}

async function sendToGoogleAnalytics(event: any) {
  // TODO: Implement GA4 Measurement Protocol
  // const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID
  // const GA_API_SECRET = process.env.GA_API_SECRET
  
  console.log('Google Analytics (placeholder):', event)
  return Promise.resolve({ success: true })
}

async function logToFile(event: any) {
  const fs = require('fs').promises
  const path = require('path')
  
  try {
    const logPath = path.join(process.cwd(), 'analytics-events.jsonl')
    const logEntry = JSON.stringify(event) + '\n'
    await fs.appendFile(logPath, logEntry)
    return { success: true }
  } catch (error) {
    console.error('Analytics file logging error:', error)
    throw error
  }
}

async function updateConversionMetrics(event: any) {
  // Calculate and store conversion metrics
  const metrics = {
    total_signups: 1,
    variant_performance: {
      [event.properties.variant_id]: 1
    },
    source_performance: {
      [event.properties.source]: 1
    },
    segment_performance: {
      [event.properties.segment]: 1
    },
    timestamp: event.timestamp
  }
  
  console.log('Conversion metrics update:', metrics)
  
  // TODO: Store in database for dashboard
  return Promise.resolve(metrics)
}

export async function GET(request: NextRequest) {
  // Analytics dashboard endpoint
  const { searchParams } = new URL(request.url)
  const metric = searchParams.get('metric')
  const timeframe = searchParams.get('timeframe') || '7d'
  
  try {
    const analytics = await getAnalyticsData(metric, timeframe)
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

async function getAnalyticsData(metric: string | null, timeframe: string) {
  // Mock analytics data - replace with real database queries
  const mockData = {
    waitlist_performance: {
      total_signups: 127,
      conversion_rate: 0.084,
      top_sources: [
        { source: 'twitter', signups: 45, conversion_rate: 0.092 },
        { source: 'direct', signups: 38, conversion_rate: 0.081 },
        { source: 'hackernews', signups: 28, conversion_rate: 0.076 },
        { source: 'linkedin', signups: 16, conversion_rate: 0.089 }
      ],
      variant_performance: [
        { variant: 'problem_focused', signups: 38, conversion_rate: 0.095 },
        { variant: 'social_proof', signups: 34, conversion_rate: 0.087 },
        { variant: 'urgency', signups: 31, conversion_rate: 0.082 },
        { variant: 'control', signups: 24, conversion_rate: 0.071 }
      ],
      segment_breakdown: {
        tech_twitter: 42,
        professional: 29,
        hacker_news: 28,
        reddit: 15,
        general: 13
      }
    },
    engagement_metrics: {
      page_views: 1547,
      unique_visitors: 982,
      avg_time_on_site: 142,
      bounce_rate: 0.34
    },
    social_metrics: {
      mentions: 23,
      shares: 67,
      click_through_rate: 0.089,
      viral_coefficient: 1.2
    }
  }
  
  if (metric && mockData[metric as keyof typeof mockData]) {
    return mockData[metric as keyof typeof mockData]
  }
  
  return mockData
}