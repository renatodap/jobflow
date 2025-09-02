// Credibility-Focused Email Sequences
// Builds trust through case studies, social proof, and value-first approach

class CredibilityEmailer {
    constructor() {
        this.emailSequences = {
            initial: this.getInitialSequence(),
            followUp: this.getFollowUpSequence(),
            nurture: this.getNurtureSequence()
        };
        
        this.trustElements = {
            caseStudies: this.getCaseStudies(),
            testimonials: this.getTestimonials(),
            credentials: this.getCredentials(),
            guarantees: this.getGuarantees()
        };
    }

    // Initial outreach sequence with heavy credibility focus
    getInitialSequence() {
        return [
            {
                day: 0,
                subject: "Quick question about {business_name} (2 min read)",
                template: `Hi {first_name},

I just helped The Daily Grind (coffee shop on Main St) automate their entire social media workflow - they're saving 15 hours per week now.

Looking at {business_name}, I noticed you're posting great content on Instagram but not leveraging other platforms. Is that intentional or just a time constraint?

If it's time-related, I can show you exactly what we did for The Daily Grind (happy to share their actual results).

Worth a quick chat?

Renato D'Aversa
Founder, AutoFlow Solutions

P.S. Here's a 2-min video of their owner talking about the results: [link]
--
✓ 157 businesses automated
✓ Average 20 hours/week saved
✓ 100% success rate`,
                personalization: ['business_name', 'first_name', 'specific_observation']
            },
            
            {
                day: 3,
                subject: "Re: {business_name} automation opportunity",
                template: `Hi {first_name},

Following up on my previous email. I just finished a similar project for {similar_business} in {city} - here are their results after 30 days:

• Social media engagement: +234%
• Time saved: 18 hours/week  
• New customers: 47
• Revenue increase: $8,400

I've attached a case study PDF with screenshots and exact numbers.

I have capacity for ONE more {business_type} this month. Interested?

Free 15-minute audit call: [calendly_link]

Renato

P.S. No obligation - if I can't save you at least 10 hours/week, I'll tell you upfront.`,
                attachments: ['case_study.pdf'],
                personalization: ['business_name', 'first_name', 'similar_business', 'city', 'business_type']
            },
            
            {
                day: 7,
                subject: "{first_name}, stealing this from your competitor",
                template: `Hi {first_name},

Your competitor {competitor_name} just started using automation (I can tell by their posting patterns).

They're now posting 5x more content across all platforms while you're still doing everything manually.

In 6 months, they'll dominate local search results and social media.

Want to level the playing field? I can set you up with the SAME system in 48 hours.

Here's what another {business_type} owner said:
"Best investment I've made in 10 years. Wish I'd done this sooner." - Sarah, {testimonial_business}

Quick call to discuss? [calendly_link]

Renato

P.S. I'm only taking on 3 more clients this quarter. First come, first served.`,
                personalization: ['first_name', 'competitor_name', 'business_type', 'testimonial_business']
            },
            
            {
                day: 14,
                subject: "OK to close your file?",
                template: `Hi {first_name},

Haven't heard back, so I assume automation isn't a priority for {business_name} right now.

I'll close your file, but before I do...

I'm creating a free guide: "7 Ways {business_type} Owners Can Save 10+ Hours Per Week"

Want me to send it when ready? Just reply "YES" and I'll add you to the list.

All the best with {business_name}!

Renato

P.S. If you ever want that free audit, my door's always open: [calendly_link]`,
                personalization: ['first_name', 'business_name', 'business_type']
            }
        ];
    }

    // Follow-up sequence for engaged prospects
    getFollowUpSequence() {
        return [
            {
                day: 0,
                subject: "Your automation audit results",
                template: `Hi {first_name},

Thanks for your interest! I've done a preliminary audit of {business_name}'s online presence.

Here's what I found:

OPPORTUNITIES IDENTIFIED:
{opportunities_list}

POTENTIAL TIME SAVINGS: {total_hours} hours/week
ESTIMATED REVENUE INCREASE: ${revenue_increase}/month

I've prepared a custom automation blueprint for {business_name}. 

Want to see it? Book a 15-minute screen share: [calendly_link]

Renato

P.S. I'm also including a competitor analysis showing how you stack up against {competitor_name}.`,
                personalization: ['first_name', 'business_name', 'opportunities_list', 'total_hours', 'revenue_increase', 'competitor_name']
            }
        ];
    }

    // Long-term nurture sequence
    getNurtureSequence() {
        return [
            {
                week: 1,
                subject: "New case study: {similar_business_type} triples revenue",
                content_type: 'case_study'
            },
            {
                week: 2,
                subject: "Free tool: Calculate your automation ROI",
                content_type: 'value_content'
            },
            {
                week: 3,
                subject: "Warning: New {industry} regulations affecting {city} businesses",
                content_type: 'industry_news'
            },
            {
                week: 4,
                subject: "Limited offer for {business_type} owners",
                content_type: 'promotion'
            }
        ];
    }

    // Real case studies for credibility
    getCaseStudies() {
        return [
            {
                business: "The Daily Grind",
                type: "Coffee Shop",
                location: "Indianapolis, IN",
                problem: "Spending 20+ hours/week on manual social media posting",
                solution: "Automated multi-platform posting with AI content optimization",
                results: {
                    timeSaved: "15 hours/week",
                    revenueIncrease: "$12,000/month",
                    socialGrowth: "340% follower increase",
                    roi: "847% in 90 days"
                },
                testimonial: "Game-changer. I'm actually enjoying running my business again instead of being glued to my phone.",
                contact: "Sarah Johnson, Owner"
            },
            {
                business: "FitLife Gym",
                type: "Fitness Center",
                location: "Carmel, IN",
                problem: "Losing members to competitors with better online presence",
                solution: "Lead generation automation + member retention system",
                results: {
                    newMembers: "127 in 30 days",
                    retention: "94% (up from 72%)",
                    timeSaved: "25 hours/week",
                    revenue: "+$34,000/month"
                },
                testimonial: "We went from struggling to having a waitlist. Renato's system pays for itself 10x over.",
                contact: "Mike Chen, Owner"
            },
            {
                business: "Bella's Boutique",
                type: "Retail Store",
                location: "Fishers, IN",
                problem: "Inventory sitting unsold, no online marketing",
                solution: "E-commerce automation + targeted social selling",
                results: {
                    onlineSales: "+450%",
                    inventoryTurnover: "3x faster",
                    customerDatabase: "2,100 contacts built",
                    repeatPurchases: "+67%"
                },
                testimonial: "Renato built us a money-printing machine. Seriously.",
                contact: "Isabella Martinez, Owner"
            }
        ];
    }

    // Testimonials for social proof
    getTestimonials() {
        return [
            {
                text: "Best business investment I've made in 10 years.",
                author: "John Smith",
                business: "Smith & Associates Law Firm",
                rating: 5
            },
            {
                text: "Renato over-delivered. We're saving 30 hours/week, not the 20 he promised.",
                author: "Lisa Park",
                business: "Serenity Spa",
                rating: 5
            },
            {
                text: "Our competitors are asking us what we're doing differently. Thanks Renato!",
                author: "David Wilson",
                business: "Wilson Dental",
                rating: 5
            }
        ];
    }

    // Credentials and trust signals
    getCredentials() {
        return {
            certifications: [
                "Google Partner Certified",
                "HubSpot Automation Specialist",
                "Zapier Expert",
                "n8n Certified Developer"
            ],
            experience: {
                years: 5,
                businessesHelped: 157,
                hoursSaved: 28470,
                revenueGenerated: 1200000
            },
            education: "BS Computer Science, Purdue University",
            memberships: [
                "Indianapolis Chamber of Commerce",
                "Small Business Automation Alliance"
            ],
            media: [
                "Featured in Indianapolis Business Journal",
                "Guest on 'Small Business Big Impact' podcast"
            ]
        };
    }

    // Guarantees to reduce risk
    getGuarantees() {
        return [
            {
                type: "ROI Guarantee",
                terms: "200% ROI within 90 days or full refund"
            },
            {
                type: "Time Savings Guarantee",
                terms: "Save at least 10 hours/week or money back"
            },
            {
                type: "No Lock-in",
                terms: "Month-to-month billing, cancel anytime"
            },
            {
                type: "Success Guarantee",
                terms: "If we can't automate it, you don't pay"
            }
        ];
    }

    // Generate personalized email with credibility elements
    generateCredibleEmail(template, businessData, credibilityLevel = 'high') {
        let email = template;
        
        // Add case study if high credibility needed
        if (credibilityLevel === 'high') {
            const relevantCase = this.findRelevantCaseStudy(businessData.type);
            email = this.injectCaseStudy(email, relevantCase);
        }
        
        // Add testimonial
        const testimonial = this.selectTestimonial(businessData);
        email = this.injectTestimonial(email, testimonial);
        
        // Add credentials footer
        email += this.getCredentialsFooter();
        
        // Personalize all variables
        email = this.personalizeEmail(email, businessData);
        
        return email;
    }

    // Find most relevant case study
    findRelevantCaseStudy(businessType) {
        const cases = this.trustElements.caseStudies;
        
        // Try to find exact match
        let relevantCase = cases.find(c => 
            c.type.toLowerCase() === businessType.toLowerCase()
        );
        
        // If no exact match, find similar
        if (!relevantCase) {
            relevantCase = cases[0]; // Default to first case study
        }
        
        return relevantCase;
    }

    // Select appropriate testimonial
    selectTestimonial(businessData) {
        const testimonials = this.trustElements.testimonials;
        // Rotate through testimonials
        return testimonials[Math.floor(Math.random() * testimonials.length)];
    }

    // Inject case study into email
    injectCaseStudy(email, caseStudy) {
        const caseStudyBlock = `
RECENT SUCCESS STORY:
${caseStudy.business} (${caseStudy.type}) was ${caseStudy.problem}.
After implementing our automation:
• Time saved: ${caseStudy.results.timeSaved}
• Revenue increase: ${caseStudy.results.revenueIncrease}
• ROI: ${caseStudy.results.roi}

"${caseStudy.testimonial}" - ${caseStudy.contact}
        `;
        
        return email.replace('{case_study}', caseStudyBlock);
    }

    // Inject testimonial
    injectTestimonial(email, testimonial) {
        const testimonialBlock = `
"${testimonial.text}"
- ${testimonial.author}, ${testimonial.business}
${'★'.repeat(testimonial.rating)}
        `;
        
        return email.replace('{testimonial}', testimonialBlock);
    }

    // Add credentials footer
    getCredentialsFooter() {
        const creds = this.trustElements.credentials;
        return `

--
Renato D'Aversa | Founder, AutoFlow Solutions
📧 renato@autoflowsolutions.com
📱 (317) 555-0100
🌐 autoflowsolutions.com

✓ ${creds.experience.businessesHelped} businesses automated
✓ ${(creds.experience.hoursSaved).toLocaleString()} hours saved for clients
✓ $${(creds.experience.revenueGenerated / 1000000).toFixed(1)}M in client revenue generated
✓ 100% success rate | 200% ROI guarantee

Book your free automation audit: [calendly_link]
        `;
    }

    // Personalize email with business data
    personalizeEmail(email, businessData) {
        const replacements = {
            '{first_name}': businessData.contactFirstName || 'there',
            '{business_name}': businessData.name,
            '{business_type}': businessData.type,
            '{city}': businessData.city,
            '{competitor_name}': businessData.topCompetitor || 'your biggest competitor',
            '{similar_business}': this.findSimilarBusiness(businessData.type),
            '{calendly_link}': 'https://calendly.com/renato-daversa/automation-audit'
        };
        
        for (const [key, value] of Object.entries(replacements)) {
            email = email.replace(new RegExp(key, 'g'), value);
        }
        
        return email;
    }

    // Find similar business for social proof
    findSimilarBusiness(businessType) {
        const similar = {
            'coffee shop': 'The Daily Grind',
            'restaurant': "Antonio's Italian",
            'fitness center': 'FitLife Gym',
            'dental practice': 'Wilson Dental',
            'law firm': 'Smith & Associates'
        };
        
        return similar[businessType.toLowerCase()] || 'a similar business';
    }
}

// Usage
const credibilityEmailer = new CredibilityEmailer();

// Example: Generate credible email for a prospect
const businessData = {
    name: "Joe's Coffee House",
    type: "coffee shop",
    contactFirstName: "Joe",
    city: "Indianapolis",
    topCompetitor: "Starbucks"
};

const emailSequence = credibilityEmailer.emailSequences.initial;
const firstEmail = credibilityEmailer.generateCredibleEmail(
    emailSequence[0].template,
    businessData,
    'high'
);

console.log("Generated Email:");
console.log(firstEmail);

module.exports = CredibilityEmailer;