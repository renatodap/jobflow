// Automated Email Outreach System
// Sends personalized emails automatically with follow-ups

const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

class EmailAutomation {
    constructor(config) {
        this.config = {
            email: config.email || process.env.EMAIL_ADDRESS,
            password: config.password || process.env.EMAIL_PASSWORD,
            smtp: config.smtp || 'smtp.gmail.com',
            port: config.port || 587,
            dailyLimit: config.dailyLimit || 50,
            delayBetweenEmails: config.delayBetweenEmails || 120000, // 2 minutes
            followUpDays: config.followUpDays || [3, 7, 14] // Days after initial email
        };

        this.transporter = nodemailer.createTransport({
            host: this.config.smtp,
            port: this.config.port,
            secure: false,
            auth: {
                user: this.config.email,
                pass: this.config.password
            }
        });

        this.sentEmails = [];
        this.scheduledFollowUps = [];
    }

    // Load email templates
    async loadTemplates() {
        const templates = {
            initial: {
                subject: "Quick question about {business_name}'s social media",
                body: `Hi {first_name},

I noticed {business_name} creates amazing content on Instagram, but I couldn't find you on other platforms. 

Are you manually posting to each social media platform separately? Most {business_type} owners I talk to spend 10+ hours per week on this.

We recently helped {similar_business} automate their entire social media workflow - one post automatically goes to Instagram, Facebook, LinkedIn, Twitter, and TikTok with platform-specific optimization.

They're saving 10 hours per week and seeing 3x more engagement.

Would you be interested in a quick 5-minute demo of how this could work for {business_name}?

Best regards,
{sender_name}

P.S. I have a few slots open this week if you'd like to see it in action.`
            },
            
            followUp1: {
                subject: "Re: Quick question about {business_name}'s social media",
                body: `Hi {first_name},

Just wanted to follow up on my previous email about automating {business_name}'s social media.

I understand you're busy running {business_name}, so I'll keep this brief:

✓ Post once, publish everywhere
✓ Save 10+ hours per week
✓ 3x more engagement
✓ Set up in 24 hours

Here's a 2-minute video showing exactly how it works: [link]

Worth a quick chat?

{sender_name}`
            },
            
            followUp2: {
                subject: "Last check-in about {business_name}",
                body: `Hi {first_name},

I'll keep this super short - I know you're busy.

I'm helping 3 other {business_type} in {city} automate their social media this month.

If you're interested, I can include {business_name} - but I only have room for one more client.

Just reply "YES" if you want the details.

{sender_name}`
            },
            
            followUp3: {
                subject: "OK to close your file?",
                body: `Hi {first_name},

Haven't heard back from you, so I'm assuming social media automation isn't a priority for {business_name} right now.

I'll close your file, but if things change, feel free to reach out.

By the way, I'm creating a free guide: "5 Ways {business_type} Can Save 10 Hours Per Week" - want me to send it when it's ready?

All the best with {business_name}!

{sender_name}`
            }
        };

        return templates;
    }

    // Personalize email template with lead data
    personalizeEmail(template, leadData) {
        let subject = template.subject;
        let body = template.body;

        // Replace all placeholders
        const replacements = {
            '{first_name}': leadData.firstName || 'there',
            '{business_name}': leadData.businessName,
            '{business_type}': leadData.businessType || 'businesses',
            '{city}': leadData.city || 'your area',
            '{similar_business}': this.getSimilarBusiness(leadData.businessType),
            '{sender_name}': 'Renato',
            '{sender_title}': 'Automation Specialist'
        };

        for (const [placeholder, value] of Object.entries(replacements)) {
            subject = subject.replace(new RegExp(placeholder, 'g'), value);
            body = body.replace(new RegExp(placeholder, 'g'), value);
        }

        return { subject, body };
    }

    // Get similar business for social proof
    getSimilarBusiness(businessType) {
        const examples = {
            'cafe': 'The Daily Grind (a coffee shop in Broad Ripple)',
            'restaurant': "Antonio's Italian Restaurant",
            'fitness': 'FitLife Gym on Mass Ave',
            'salon': 'Bella Beauty Salon in Carmel',
            'retail': 'Urban Threads Boutique',
            'default': 'a similar business in your industry'
        };

        return examples[businessType] || examples.default;
    }

    // Send single email
    async sendEmail(to, subject, body, leadId) {
        try {
            const mailOptions = {
                from: `Renato <${this.config.email}>`,
                to: to,
                subject: subject,
                text: body,
                html: body.replace(/\n/g, '<br>'),
                headers: {
                    'X-Lead-ID': leadId,
                    'X-Campaign': 'automation-outreach'
                }
            };

            const info = await this.transporter.sendMail(mailOptions);
            
            // Log sent email
            this.sentEmails.push({
                leadId,
                email: to,
                subject,
                messageId: info.messageId,
                sentAt: new Date().toISOString(),
                status: 'sent'
            });

            console.log(`✅ Email sent to ${to}`);
            return { success: true, messageId: info.messageId };

        } catch (error) {
            console.error(`❌ Failed to send email to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    // Process email campaign for multiple leads
    async runCampaign(leads, campaignType = 'initial') {
        const templates = await this.loadTemplates();
        const template = templates[campaignType];
        
        let sentCount = 0;
        const results = [];

        for (const lead of leads) {
            // Check daily limit
            if (sentCount >= this.config.dailyLimit) {
                console.log(`Daily limit of ${this.config.dailyLimit} emails reached`);
                break;
            }

            // Skip if no email
            if (!lead.email) {
                console.log(`Skipping ${lead.businessName} - no email`);
                continue;
            }

            // Personalize email
            const { subject, body } = this.personalizeEmail(template, lead);
            
            // Send email
            const result = await this.sendEmail(lead.email, subject, body, lead.id);
            results.push({ ...result, leadId: lead.id });

            if (result.success) {
                sentCount++;
                
                // Schedule follow-ups if initial email
                if (campaignType === 'initial') {
                    this.scheduleFollowUps(lead);
                }
            }

            // Delay between emails
            if (sentCount < leads.length && sentCount < this.config.dailyLimit) {
                await this.delay(this.config.delayBetweenEmails);
            }
        }

        // Save campaign results
        await this.saveCampaignResults(results);
        
        return {
            sent: sentCount,
            total: leads.length,
            results
        };
    }

    // Schedule follow-up emails
    scheduleFollowUps(lead) {
        const followUpDates = this.config.followUpDays.map(days => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date;
        });

        this.scheduledFollowUps.push({
            leadId: lead.id,
            lead: lead,
            followUps: [
                { date: followUpDates[0], template: 'followUp1', sent: false },
                { date: followUpDates[1], template: 'followUp2', sent: false },
                { date: followUpDates[2], template: 'followUp3', sent: false }
            ]
        });

        console.log(`📅 Scheduled 3 follow-ups for ${lead.businessName}`);
    }

    // Process scheduled follow-ups
    async processFollowUps() {
        const now = new Date();
        const templates = await this.loadTemplates();
        
        for (const schedule of this.scheduledFollowUps) {
            for (const followUp of schedule.followUps) {
                if (!followUp.sent && followUp.date <= now) {
                    const template = templates[followUp.template];
                    const { subject, body } = this.personalizeEmail(template, schedule.lead);
                    
                    const result = await this.sendEmail(
                        schedule.lead.email,
                        subject,
                        body,
                        schedule.leadId
                    );
                    
                    if (result.success) {
                        followUp.sent = true;
                        followUp.sentAt = new Date().toISOString();
                    }
                    
                    // Respect rate limits
                    await this.delay(this.config.delayBetweenEmails);
                }
            }
        }
    }

    // Save campaign results to file
    async saveCampaignResults(results) {
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const filename = `campaign_results_${timestamp}.json`;
        
        await fs.writeFile(
            path.join(__dirname, '..', 'campaign_results', filename),
            JSON.stringify({
                timestamp: new Date().toISOString(),
                results,
                sentEmails: this.sentEmails,
                scheduledFollowUps: this.scheduledFollowUps
            }, null, 2)
        );
        
        console.log(`📊 Results saved to ${filename}`);
    }

    // Track email opens (requires email tracking pixel)
    trackOpen(leadId, emailId) {
        const tracking = {
            leadId,
            emailId,
            openedAt: new Date().toISOString(),
            userAgent: 'tracked'
        };
        
        console.log(`📧 Email opened by lead ${leadId}`);
        return tracking;
    }

    // Track link clicks
    trackClick(leadId, emailId, link) {
        const tracking = {
            leadId,
            emailId,
            link,
            clickedAt: new Date().toISOString()
        };
        
        console.log(`🔗 Link clicked by lead ${leadId}: ${link}`);
        return tracking;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Example usage
async function runAutomatedOutreach() {
    const automation = new EmailAutomation({
        email: 'your-email@gmail.com',
        password: 'your-app-password',
        dailyLimit: 25
    });

    // Load leads from scraper results
    const leads = [
        {
            id: 1,
            firstName: 'John',
            businessName: 'The Daily Grind',
            businessType: 'cafe',
            email: 'contact@dailygrind.com',
            city: 'Indianapolis'
        },
        {
            id: 2,
            firstName: 'Sarah',
            businessName: 'Java Junction',
            businessType: 'cafe',
            email: 'info@javajunction.com',
            city: 'Carmel'
        }
    ];

    // Run initial campaign
    const results = await automation.runCampaign(leads, 'initial');
    console.log(`Campaign complete: ${results.sent}/${results.total} emails sent`);

    // Set up follow-up processor (run daily)
    setInterval(async () => {
        await automation.processFollowUps();
    }, 24 * 60 * 60 * 1000); // Run once per day
}

module.exports = EmailAutomation;

// Run if executed directly
if (require.main === module) {
    runAutomatedOutreach().catch(console.error);
}