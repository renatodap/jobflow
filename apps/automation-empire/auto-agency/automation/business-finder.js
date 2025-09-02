// Automated Business Finder & Qualifier
// Finds businesses that need automation and scores them

const axios = require('axios');
const cheerio = require('cheerio');

class BusinessFinder {
    constructor() {
        this.qualificationCriteria = {
            // High-value indicators (positive scoring)
            hasWebsite: { weight: 10, required: false },
            activeOnSocial: { weight: 15, required: false },
            highRating: { weight: 8, required: false },
            multipleLocations: { weight: 20, required: false },
            businessAge: { weight: 5, required: false },
            
            // Pain point indicators (what makes them need us)
            inconsistentPosting: { weight: 25, required: false },
            noEmailMarketing: { weight: 20, required: false },
            manualProcesses: { weight: 15, required: false },
            competitorAutomation: { weight: 10, required: false }
        };

        this.idealBusinessTypes = [
            'coffee shop', 'restaurant', 'fitness center', 'gym',
            'dental practice', 'medical clinic', 'real estate agency',
            'beauty salon', 'spa', 'auto repair', 'law firm',
            'accounting firm', 'insurance agency', 'retail store'
        ];

        this.targetCities = [
            'Indianapolis, IN', 'Carmel, IN', 'Fishers, IN',
            'Westfield, IN', 'Zionsville, IN', 'Noblesville, IN'
        ];
    }

    // Main function to find qualified businesses
    async findQualifiedBusinesses(searchParams = {}) {
        const { 
            businessType = 'coffee shop',
            location = 'Indianapolis, IN',
            maxResults = 100 
        } = searchParams;

        console.log(`🔍 Searching for ${businessType} in ${location}...`);

        // Step 1: Find businesses from multiple sources
        const businesses = await this.aggregateBusinessData(businessType, location);
        
        // Step 2: Enrich with additional data
        const enrichedBusinesses = await this.enrichBusinessData(businesses);
        
        // Step 3: Score and qualify
        const qualifiedBusinesses = this.qualifyBusinesses(enrichedBusinesses);
        
        // Step 4: Sort by opportunity score
        qualifiedBusinesses.sort((a, b) => b.opportunityScore - a.opportunityScore);
        
        return qualifiedBusinesses.slice(0, maxResults);
    }

    // Aggregate business data from multiple sources
    async aggregateBusinessData(businessType, location) {
        const businesses = [];
        
        // Source 1: Google Places API (mock for now)
        const googleBusinesses = await this.searchGooglePlaces(businessType, location);
        businesses.push(...googleBusinesses);
        
        // Source 2: Yelp API (mock for now)
        const yelpBusinesses = await this.searchYelp(businessType, location);
        businesses.push(...yelpBusinesses);
        
        // Source 3: Facebook Business Directory
        const fbBusinesses = await this.searchFacebookBusinesses(businessType, location);
        businesses.push(...fbBusinesses);
        
        // Deduplicate
        return this.deduplicateBusinesses(businesses);
    }

    // Mock Google Places search
    async searchGooglePlaces(businessType, location) {
        // In production, use actual Google Places API
        return [
            {
                name: "The Daily Grind",
                type: "coffee shop",
                address: "123 Main St, Indianapolis, IN",
                phone: "(317) 555-0001",
                website: "https://dailygrind.com",
                rating: 4.7,
                reviewCount: 234,
                source: "google"
            },
            {
                name: "Java Junction",
                type: "coffee shop",
                address: "456 Market St, Carmel, IN",
                phone: "(317) 555-0002",
                website: null,
                rating: 4.5,
                reviewCount: 189,
                source: "google"
            },
            {
                name: "Perk Up Cafe",
                type: "coffee shop",
                address: "789 Broadway, Fishers, IN",
                phone: "(317) 555-0003",
                website: "https://perkupcafe.com",
                rating: 4.8,
                reviewCount: 412,
                source: "google"
            }
        ];
    }

    // Mock Yelp search
    async searchYelp(businessType, location) {
        return [
            {
                name: "Urban Coffee House",
                type: "coffee shop",
                address: "321 Downtown Ave, Indianapolis, IN",
                phone: "(317) 555-0004",
                website: "https://urbancoffee.com",
                rating: 4.6,
                reviewCount: 156,
                source: "yelp"
            }
        ];
    }

    // Mock Facebook search
    async searchFacebookBusinesses(businessType, location) {
        return [
            {
                name: "The Coffee Bean",
                type: "coffee shop",
                address: "555 North St, Zionsville, IN",
                phone: "(317) 555-0005",
                website: null,
                rating: 4.4,
                reviewCount: 89,
                facebookPage: "https://facebook.com/coffeebeanindy",
                source: "facebook"
            }
        ];
    }

    // Enrich business data with social media and web presence
    async enrichBusinessData(businesses) {
        const enrichedBusinesses = [];
        
        for (const business of businesses) {
            const enriched = { ...business };
            
            // Check website status
            if (business.website) {
                enriched.websiteData = await this.analyzeWebsite(business.website);
            }
            
            // Check social media presence
            enriched.socialMedia = await this.checkSocialMediaPresence(business);
            
            // Analyze automation opportunities
            enriched.automationOpportunities = this.identifyAutomationOpportunities(enriched);
            
            // Find decision maker
            enriched.decisionMaker = await this.findDecisionMaker(business);
            
            enrichedBusinesses.push(enriched);
        }
        
        return enrichedBusinesses;
    }

    // Analyze website for automation opportunities
    async analyzeWebsite(websiteUrl) {
        try {
            // Mock analysis - in production, actually fetch and analyze
            return {
                hasContactForm: true,
                hasNewsletter: false,
                lastUpdated: '2023-06-15',
                loadTime: 2.3,
                mobileOptimized: true,
                hasChat: false,
                hasCRM: false,
                technology: ['WordPress', 'WooCommerce']
            };
        } catch (error) {
            return null;
        }
    }

    // Check social media presence and activity
    async checkSocialMediaPresence(business) {
        const social = {
            facebook: { present: false, lastPost: null, followers: 0, postFrequency: 0 },
            instagram: { present: false, lastPost: null, followers: 0, postFrequency: 0 },
            twitter: { present: false, lastPost: null, followers: 0, postFrequency: 0 },
            linkedin: { present: false, lastPost: null, followers: 0, postFrequency: 0 },
            tiktok: { present: false, lastPost: null, followers: 0, postFrequency: 0 }
        };

        // Mock data - in production, actually check each platform
        social.facebook = {
            present: true,
            lastPost: new Date('2024-01-10'),
            followers: 1234,
            postFrequency: 2 // posts per week
        };

        social.instagram = {
            present: true,
            lastPost: new Date('2024-01-05'),
            followers: 890,
            postFrequency: 0.5 // posts per week
        };

        return social;
    }

    // Identify specific automation opportunities
    identifyAutomationOpportunities(business) {
        const opportunities = [];
        
        // Social media automation
        const socialPlatforms = Object.keys(business.socialMedia || {});
        const activePlatforms = socialPlatforms.filter(p => business.socialMedia[p].present);
        
        if (activePlatforms.length > 0 && activePlatforms.length < 5) {
            opportunities.push({
                type: 'social_expansion',
                value: 'Not utilizing all social platforms',
                solution: 'Multi-platform posting automation',
                savingsHours: 10
            });
        }
        
        // Inconsistent posting
        const avgPostFrequency = activePlatforms.reduce((sum, p) => 
            sum + (business.socialMedia[p].postFrequency || 0), 0) / activePlatforms.length;
        
        if (avgPostFrequency < 3) {
            opportunities.push({
                type: 'posting_consistency',
                value: 'Inconsistent social media posting',
                solution: 'Automated content scheduling',
                savingsHours: 8
            });
        }
        
        // Email marketing
        if (!business.websiteData?.hasNewsletter) {
            opportunities.push({
                type: 'email_marketing',
                value: 'No email marketing system',
                solution: 'Automated email campaigns',
                savingsHours: 5
            });
        }
        
        // Customer engagement
        if (!business.websiteData?.hasChat) {
            opportunities.push({
                type: 'customer_engagement',
                value: 'No automated customer support',
                solution: 'AI chatbot integration',
                savingsHours: 15
            });
        }
        
        // Lead generation
        if (business.reviewCount < 100) {
            opportunities.push({
                type: 'lead_generation',
                value: 'Low online visibility',
                solution: 'Automated lead generation system',
                savingsHours: 12
            });
        }
        
        return opportunities;
    }

    // Find decision maker contact info
    async findDecisionMaker(business) {
        // Mock data - in production, use LinkedIn API, Hunter.io, etc.
        return {
            name: "John Smith",
            title: "Owner",
            email: `contact@${business.name.toLowerCase().replace(/\s+/g, '')}.com`,
            linkedin: null,
            confidence: 0.7
        };
    }

    // Score and qualify businesses
    qualifyBusinesses(businesses) {
        return businesses.map(business => {
            let score = 0;
            const qualificationNotes = [];
            
            // Score based on business characteristics
            if (business.website) {
                score += 10;
                qualificationNotes.push('Has website (+10)');
            }
            
            if (business.rating >= 4.5) {
                score += 8;
                qualificationNotes.push('High rating (+8)');
            }
            
            if (business.reviewCount > 100) {
                score += 5;
                qualificationNotes.push('Established business (+5)');
            }
            
            // Score based on automation opportunities
            const opportunities = business.automationOpportunities || [];
            const totalSavings = opportunities.reduce((sum, opp) => sum + opp.savingsHours, 0);
            
            if (totalSavings > 20) {
                score += 25;
                qualificationNotes.push(`High automation potential: ${totalSavings} hrs/week (+25)`);
            } else if (totalSavings > 10) {
                score += 15;
                qualificationNotes.push(`Medium automation potential: ${totalSavings} hrs/week (+15)`);
            }
            
            // Score based on social media gaps
            const socialPlatforms = Object.values(business.socialMedia || {});
            const inactivePlatforms = socialPlatforms.filter(p => !p.present).length;
            
            if (inactivePlatforms >= 3) {
                score += 20;
                qualificationNotes.push('Multiple social platforms unused (+20)');
            }
            
            // Calculate final opportunity score
            business.opportunityScore = score;
            business.qualificationNotes = qualificationNotes;
            business.estimatedValue = this.calculateBusinessValue(business);
            business.priority = score > 50 ? 'High' : score > 30 ? 'Medium' : 'Low';
            
            return business;
        });
    }

    // Calculate potential business value
    calculateBusinessValue(business) {
        const baseSetupFee = 997;
        const baseMonthlyFee = 297;
        
        // Adjust based on business size and complexity
        let setupMultiplier = 1;
        let monthlyMultiplier = 1;
        
        if (business.reviewCount > 500) setupMultiplier = 1.5;
        if (business.multipleLocations) setupMultiplier = 2;
        
        const opportunities = business.automationOpportunities || [];
        if (opportunities.length > 4) monthlyMultiplier = 1.5;
        
        return {
            setupFee: Math.round(baseSetupFee * setupMultiplier),
            monthlyFee: Math.round(baseMonthlyFee * monthlyMultiplier),
            annualValue: Math.round((baseSetupFee * setupMultiplier) + (baseMonthlyFee * monthlyMultiplier * 12)),
            lifetimeValue: Math.round((baseSetupFee * setupMultiplier) + (baseMonthlyFee * monthlyMultiplier * 36))
        };
    }

    // Deduplicate businesses from multiple sources
    deduplicateBusinesses(businesses) {
        const unique = new Map();
        
        businesses.forEach(business => {
            const key = `${business.name.toLowerCase()}_${business.address?.toLowerCase() || ''}`;
            if (!unique.has(key)) {
                unique.set(key, business);
            } else {
                // Merge data from multiple sources
                const existing = unique.get(key);
                unique.set(key, { ...existing, ...business });
            }
        });
        
        return Array.from(unique.values());
    }

    // Export qualified leads to CSV
    exportToCSV(businesses) {
        const csv = [
            'Business Name,Type,Location,Score,Priority,Setup Fee,Monthly Fee,Contact Email,Opportunities'
        ];
        
        businesses.forEach(b => {
            const opportunities = b.automationOpportunities.map(o => o.type).join(';');
            csv.push(
                `"${b.name}","${b.type}","${b.address}",${b.opportunityScore},"${b.priority}",` +
                `$${b.estimatedValue.setupFee},$${b.estimatedValue.monthlyFee},"${b.decisionMaker?.email || ''}","${opportunities}"`
            );
        });
        
        return csv.join('\n');
    }
}

// Usage
async function findAndQualifyBusinesses() {
    const finder = new BusinessFinder();
    
    // Find businesses for each type and location
    const allBusinesses = [];
    
    for (const businessType of finder.idealBusinessTypes.slice(0, 3)) {
        for (const location of finder.targetCities.slice(0, 2)) {
            const businesses = await finder.findQualifiedBusinesses({
                businessType,
                location,
                maxResults: 10
            });
            allBusinesses.push(...businesses);
        }
    }
    
    // Sort by opportunity score
    allBusinesses.sort((a, b) => b.opportunityScore - a.opportunityScore);
    
    // Export top prospects
    const topProspects = allBusinesses.slice(0, 50);
    const csv = finder.exportToCSV(topProspects);
    
    // Save to file
    const fs = require('fs');
    fs.writeFileSync('qualified_leads.csv', csv);
    
    console.log(`✅ Found ${topProspects.length} qualified businesses`);
    console.log(`📊 Average opportunity score: ${(topProspects.reduce((sum, b) => sum + b.opportunityScore, 0) / topProspects.length).toFixed(1)}`);
    console.log(`💰 Total potential value: $${topProspects.reduce((sum, b) => sum + b.estimatedValue.annualValue, 0).toLocaleString()}`);
    
    return topProspects;
}

module.exports = BusinessFinder;

// Run if executed directly
if (require.main === module) {
    findAndQualifyBusinesses().catch(console.error);
}