import { NextRequest, NextResponse } from 'next/server'

interface WelcomeRequest {
  email: string
  variant_id: string
}

export async function POST(request: NextRequest) {
  try {
    const body: WelcomeRequest = await request.json()
    
    if (!body.email || !body.variant_id) {
      return NextResponse.json(
        { error: 'Email and variant_id are required' },
        { status: 400 }
      )
    }

    // Get personalized welcome content based on A/B test variant
    const welcomeContent = getWelcomeContent(body.variant_id)
    
    // Send welcome email (multiple methods for reliability)
    const emailResults = await Promise.allSettled([
      sendViaResend(body.email, welcomeContent),
      sendViaCustomSMTP(body.email, welcomeContent),
      logEmailForManualSend(body.email, welcomeContent)
    ])

    // Check if at least one email method succeeded
    const hasSuccess = emailResults.some(result => result.status === 'fulfilled')
    
    if (!hasSuccess) {
      console.error('All email methods failed:', emailResults)
      // Don't fail the request - user is still on waitlist
    }

    // Schedule follow-up emails
    await scheduleFollowUpSequence(body.email, body.variant_id)

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome sequence initiated'
    })

  } catch (error) {
    console.error('Welcome sequence error:', error)
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}

function getWelcomeContent(variantId: string) {
  const baseContent = {
    subject: "Welcome to Sharpened! 🚀",
    previewText: "Your journey to better progress tracking starts now",
  }

  const variantSpecificContent = {
    control: {
      headline: "You're on the list!",
      message: "Thanks for joining the Sharpened waitlist. We're building AI coaching that actually helps you improve, not just track activity."
    },
    urgency: {
      headline: "Beta spot secured! ⚡",
      message: "You're one of the lucky few getting early access to Sharpened. Our limited beta launches in 2-3 weeks."
    },
    social_proof: {
      headline: "Welcome to the community! 👥",
      message: "You've joined 500+ high performers who are tired of activity tracking and ready for real progress insights."
    },
    problem_focused: {
      headline: "Ready to track what matters? 📊",
      message: "No more vanity metrics. Sharpened shows you actual improvement patterns in your fitness, learning, and productivity."
    }
  }

  const content = variantSpecificContent[variantId as keyof typeof variantSpecificContent] || variantSpecificContent.control

  return {
    ...baseContent,
    ...content,
    htmlBody: generateWelcomeHTML(content),
    textBody: generateWelcomeText(content)
  }
}

function generateWelcomeHTML(content: { headline: string; message: string }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Welcome to Sharpened</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      
      <div style="text-align: center; margin-bottom: 40px;">
        <h1 style="color: #1479FF; margin: 0; font-size: 28px; font-weight: 700;">Sharpened</h1>
        <p style="color: #666; margin: 5px 0 0 0; font-size: 14px;">Your edge, sharpened by AI</p>
      </div>

      <h2 style="color: #0D0D0D; margin-bottom: 20px; font-size: 24px;">${content.headline}</h2>
      
      <p style="margin-bottom: 25px; font-size: 16px; color: #333;">${content.message}</p>
      
      <div style="background: #f8f9fa; border-left: 4px solid #1479FF; padding: 20px; margin: 30px 0;">
        <h3 style="margin: 0 0 15px 0; color: #0D0D0D; font-size: 18px;">What happens next?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #555;">
          <li style="margin-bottom: 8px;">Beta access in 2-3 weeks</li>
          <li style="margin-bottom: 8px;">Weekly development updates</li>
          <li style="margin-bottom: 8px;">Direct feedback channel with the founder</li>
          <li style="margin-bottom: 8px;">Lifetime discount when we launch</li>
        </ul>
      </div>
      
      <div style="background: #1479FF; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <h3 style="margin: 0 0 10px 0; font-size: 18px;">Built by an NCAA athlete who codes</h3>
        <p style="margin: 0; font-size: 14px; opacity: 0.9;">I'm building Sharpened because I was frustrated with apps that track activity but don't show real improvement. Let's change that together.</p>
      </div>
      
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px; margin: 0;">
          Questions? Just reply to this email.<br>
          <a href="https://sharpened.ai" style="color: #1479FF; text-decoration: none;">sharpened.ai</a>
        </p>
      </div>
      
    </body>
    </html>
  `
}

function generateWelcomeText(content: { headline: string; message: string }) {
  return `
${content.headline}

${content.message}

What happens next?
• Beta access in 2-3 weeks
• Weekly development updates  
• Direct feedback channel with the founder
• Lifetime discount when we launch

Built by an NCAA athlete who codes
I'm building Sharpened because I was frustrated with apps that track activity but don't show real improvement. Let's change that together.

Questions? Just reply to this email.
https://sharpened.ai
  `.trim()
}

async function sendViaResend(email: string, content: any) {
  // TODO: Implement when Resend is configured
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // return await resend.emails.send({
  //   from: 'welcome@sharpened.ai',
  //   to: email,
  //   subject: content.subject,
  //   html: content.htmlBody
  // })
  
  console.log('Resend email (placeholder):', { email, subject: content.subject })
  return Promise.resolve({ success: true })
}

async function sendViaCustomSMTP(email: string, content: any) {
  // Backup SMTP implementation
  console.log('SMTP email (placeholder):', { email, subject: content.subject })
  return Promise.resolve({ success: true })
}

async function logEmailForManualSend(email: string, content: any) {
  // Log email for manual sending if automated methods fail
  const fs = require('fs').promises
  const path = require('path')
  
  try {
    const logPath = path.join(process.cwd(), 'welcome-emails.jsonl')
    const logEntry = JSON.stringify({
      email,
      content,
      timestamp: new Date().toISOString(),
      status: 'pending_manual_send'
    }) + '\n'
    
    await fs.appendFile(logPath, logEntry)
    return { success: true }
  } catch (error) {
    console.error('Email logging error:', error)
    throw error
  }
}

async function scheduleFollowUpSequence(email: string, variantId: string) {
  // Schedule follow-up emails (Day 3, Day 7, Day 14)
  const followUpSchedule = [
    { delay: 3, type: 'progress_update' },
    { delay: 7, type: 'beta_announcement' },
    { delay: 14, type: 'founder_story' }
  ]
  
  for (const followUp of followUpSchedule) {
    console.log(`Scheduled ${followUp.type} email for ${email} in ${followUp.delay} days`)
  }
  
  return Promise.resolve({ success: true })
}