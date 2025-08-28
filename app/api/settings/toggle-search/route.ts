import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const body = await request.json()
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const { active } = body

    // In production, this would update the database
    // For now, just return success
    console.log('Search status changed to:', active)

    return NextResponse.json({ 
      success: true, 
      active,
      message: active ? 'Job search activated' : 'Job search paused' 
    })
  } catch (error) {
    console.error('Toggle search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}