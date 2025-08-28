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

    // Generate cover letter using AI
    const coverLetter = await generateCoverLetterWithAI(job, profile)

    // Create a text file response
    const blob = new Blob([coverLetter], { type: 'text/plain' })
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="cover_letter_${job.company}_${job.title.replace(/\s+/g, '_')}.txt"`
      }
    })
    
  } catch (error) {
    console.error('Cover letter generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate cover letter' },
      { status: 500 }
    )
  }
}

async function generateCoverLetterWithAI(job: any, profile: any): Promise<string> {
  // For now, return a template cover letter
  // In production, this would call OpenAI API
  
  const coverLetter = `
${profile.full_name || 'Your Name'}
${profile.email}
${profile.phone || 'Phone Number'}
${profile.location || 'Location'}

${new Date().toLocaleDateString()}

Hiring Manager
${job.company}

Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company}. With my background in software development and passion for technology, I am confident that I would be a valuable addition to your team.

${profile.ai_notes ? `I am particularly excited about this opportunity because ${profile.ai_notes}` : 'I am particularly excited about this opportunity to contribute to your innovative team.'}

My experience includes:
${profile.work_experience ? profile.work_experience.substring(0, 200) + '...' : 'Relevant experience in software development and technology projects.'}

My technical skills include:
${profile.skills || 'Various programming languages and frameworks relevant to this position.'}

I am particularly drawn to ${job.company} because of your work in ${job.category || 'technology'} and the opportunity to work on ${job.description ? job.description.substring(0, 100) + '...' : 'innovative projects that make a real impact.'} I believe my skills and enthusiasm would make me a strong contributor to your team.

Thank you for considering my application. I would welcome the opportunity to discuss how my skills and experiences align with the needs of your team. I am available for an interview at your convenience and can be reached at ${profile.email} or ${profile.phone || 'my phone number'}.

Sincerely,

${profile.full_name || 'Your Name'}

---
Tailored for: ${job.title} at ${job.company}
Generated on: ${new Date().toLocaleDateString()}
`

  return coverLetter.trim()
}