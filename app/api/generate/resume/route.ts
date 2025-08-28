import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json()
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      )
    }

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

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Generate resume using OpenAI
    const resume = await generateResumeWithAI(job, profile)

    // Create a text file response
    const blob = new Blob([resume], { type: 'text/plain' })
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="resume_${job.company}_${job.title.replace(/\s+/g, '_')}.txt"`
      }
    })
    
  } catch (error) {
    console.error('Resume generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate resume' },
      { status: 500 }
    )
  }
}

async function generateResumeWithAI(job: any, profile: any): Promise<string> {
  // For now, return a template resume
  // In production, this would call OpenAI API
  
  const resume = `
${profile.full_name || 'Your Name'}
${profile.email}
${profile.phone || 'Phone Number'}
${profile.location || 'Location'}
${profile.linkedin ? `LinkedIn: ${profile.linkedin}` : ''}
${profile.github ? `GitHub: ${profile.github}` : ''}
${profile.website ? `Portfolio: ${profile.website}` : ''}

OBJECTIVE
=========
Seeking the position of ${job.title} at ${job.company} where I can leverage my skills and experience to contribute to the team's success.

PROFESSIONAL EXPERIENCE
=======================
${profile.work_experience || 'Add your work experience here'}

EDUCATION
=========
${profile.education || 'Add your education here'}

TECHNICAL SKILLS
================
${profile.skills || 'Add your skills here'}

PROJECTS
========
${profile.projects || 'Add your projects here'}

CERTIFICATIONS
==============
${profile.certifications || 'Add your certifications here'}

---
Tailored for: ${job.title} at ${job.company}
Generated on: ${new Date().toLocaleDateString()}
`

  return resume.trim()
}