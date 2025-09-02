// LinkedIn Automation for Lead Outreach
// Automatically connect and message prospects on LinkedIn

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

class LinkedInAutomation {
    constructor(credentials) {
        this.email = credentials.email;
        this.password = credentials.password;
        this.browser = null;
        this.page = null;
        this.dailyLimits = {
            connections: 20,      // LinkedIn safe limit
            messages: 50,         // LinkedIn safe limit
            profileViews: 100     // LinkedIn safe limit
        };
        this.todayStats = {
            connections: 0,
            messages: 0,
            profileViews: 0
        };
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1366, height: 768 });
        
        // Set realistic user agent
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    }

    async login() {
        await this.page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
        
        // Enter credentials
        await this.page.type('#username', this.email, { delay: 100 });
        await this.page.type('#password', this.password, { delay: 100 });
        
        // Click login
        await this.page.click('[type="submit"]');
        await this.page.waitForNavigation({ waitUntil: 'networkidle2' });
        
        // Check if logged in successfully
        const profileIcon = await this.page.$('[data-control-name="identity_profile_photo"]');
        if (profileIcon) {
            console.log('✅ Successfully logged into LinkedIn');
            return true;
        }
        
        console.log('❌ Login failed');
        return false;
    }

    async searchProspects(searchQuery, filters = {}) {
        const prospects = [];
        
        // Build search URL with filters
        let searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(searchQuery)}`;
        
        if (filters.location) {
            searchUrl += `&geoUrn=${encodeURIComponent(filters.location)}`;
        }
        if (filters.industry) {
            searchUrl += `&industry=${encodeURIComponent(filters.industry)}`;
        }
        if (filters.connectionDegree) {
            searchUrl += `&network=${filters.connectionDegree}`; // F = 1st, S = 2nd, O = 3rd+
        }
        
        await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
        await this.delay(3000);
        
        // Extract prospect information
        const results = await this.page.evaluate(() => {
            const prospects = [];
            const cards = document.querySelectorAll('.entity-result__item');
            
            cards.forEach(card => {
                const nameElement = card.querySelector('.entity-result__title-text a span span');
                const titleElement = card.querySelector('.entity-result__primary-subtitle');
                const locationElement = card.querySelector('.entity-result__secondary-subtitle');
                const linkElement = card.querySelector('.entity-result__title-text a');
                
                if (nameElement && linkElement) {
                    prospects.push({
                        name: nameElement.innerText.trim(),
                        title: titleElement ? titleElement.innerText.trim() : '',
                        location: locationElement ? locationElement.innerText.trim() : '',
                        profileUrl: linkElement.href.split('?')[0],
                        connectionDegree: card.querySelector('.entity-result__badge-text')?.innerText || ''
                    });
                }
            });
            
            return prospects;
        });
        
        return results;
    }

    async sendConnectionRequest(profileUrl, message = '') {
        if (this.todayStats.connections >= this.dailyLimits.connections) {
            console.log('⚠️ Daily connection limit reached');
            return false;
        }
        
        await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
        await this.delay(2000);
        
        // Find and click connect button
        const connectButton = await this.page.$('button[aria-label*="Connect"]');
        if (!connectButton) {
            console.log('Already connected or pending');
            return false;
        }
        
        await connectButton.click();
        await this.delay(1000);
        
        // Add personalized note if provided
        if (message) {
            const addNoteButton = await this.page.$('button[aria-label="Add a note"]');
            if (addNoteButton) {
                await addNoteButton.click();
                await this.delay(1000);
                
                const messageBox = await this.page.$('#custom-message');
                if (messageBox) {
                    await messageBox.type(message, { delay: 50 });
                }
            }
        }
        
        // Send connection request
        const sendButton = await this.page.$('button[aria-label="Send now"]');
        if (sendButton) {
            await sendButton.click();
            this.todayStats.connections++;
            console.log(`✅ Connection request sent (${this.todayStats.connections}/${this.dailyLimits.connections})`);
            return true;
        }
        
        return false;
    }

    async sendMessage(profileUrl, message) {
        if (this.todayStats.messages >= this.dailyLimits.messages) {
            console.log('⚠️ Daily message limit reached');
            return false;
        }
        
        await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
        await this.delay(2000);
        
        // Click message button
        const messageButton = await this.page.$('button[aria-label*="Message"]');
        if (!messageButton) {
            console.log('Cannot message this person (not connected)');
            return false;
        }
        
        await messageButton.click();
        await this.delay(2000);
        
        // Type message
        const messageBox = await this.page.$('.msg-form__contenteditable');
        if (messageBox) {
            await messageBox.type(message, { delay: 50 });
            await this.delay(1000);
            
            // Send message
            const sendButton = await this.page.$('.msg-form__send-button');
            if (sendButton) {
                await sendButton.click();
                this.todayStats.messages++;
                console.log(`✅ Message sent (${this.todayStats.messages}/${this.dailyLimits.messages})`);
                return true;
            }
        }
        
        return false;
    }

    async extractContactInfo(profileUrl) {
        await this.page.goto(profileUrl, { waitUntil: 'networkidle2' });
        await this.delay(2000);
        
        // Click "Contact info" if available
        const contactInfoButton = await this.page.$('#top-card-text-details-contact-info');
        if (contactInfoButton) {
            await contactInfoButton.click();
            await this.delay(1000);
            
            const contactInfo = await this.page.evaluate(() => {
                const info = {};
                
                // Extract email
                const emailElement = document.querySelector('.ci-email a');
                if (emailElement) {
                    info.email = emailElement.innerText.trim();
                }
                
                // Extract phone
                const phoneElement = document.querySelector('.ci-phone span');
                if (phoneElement) {
                    info.phone = phoneElement.innerText.trim();
                }
                
                // Extract website
                const websiteElement = document.querySelector('.ci-websites a');
                if (websiteElement) {
                    info.website = websiteElement.href;
                }
                
                return info;
            });
            
            // Close modal
            const closeButton = await this.page.$('[data-test-modal-close-btn]');
            if (closeButton) await closeButton.click();
            
            return contactInfo;
        }
        
        return {};
    }

    async runOutreachCampaign(prospects, messageTemplate) {
        const results = [];
        
        for (const prospect of prospects) {
            console.log(`Processing ${prospect.name}...`);
            
            // Personalize message
            const personalizedMessage = this.personalizeMessage(messageTemplate, prospect);
            
            // View profile
            await this.page.goto(prospect.profileUrl, { waitUntil: 'networkidle2' });
            this.todayStats.profileViews++;
            await this.delay(3000);
            
            // Extract contact info if available
            const contactInfo = await this.extractContactInfo(prospect.profileUrl);
            
            // Determine action based on connection status
            const isConnected = await this.page.$('button[aria-label*="Message"]');
            
            let result = {
                name: prospect.name,
                profileUrl: prospect.profileUrl,
                contactInfo,
                action: null,
                success: false
            };
            
            if (isConnected) {
                // Already connected - send message
                result.action = 'message';
                result.success = await this.sendMessage(prospect.profileUrl, personalizedMessage);
            } else {
                // Not connected - send connection request
                result.action = 'connect';
                result.success = await this.sendConnectionRequest(prospect.profileUrl, personalizedMessage);
            }
            
            results.push(result);
            
            // Random delay between actions (30-90 seconds)
            const delay = 30000 + Math.random() * 60000;
            await this.delay(delay);
            
            // Check daily limits
            if (this.todayStats.connections >= this.dailyLimits.connections &&
                this.todayStats.messages >= this.dailyLimits.messages) {
                console.log('Daily limits reached. Stopping campaign.');
                break;
            }
        }
        
        return results;
    }

    personalizeMessage(template, prospect) {
        let message = template;
        
        const replacements = {
            '{name}': prospect.name.split(' ')[0], // First name only
            '{title}': prospect.title,
            '{company}': this.extractCompany(prospect.title),
            '{location}': prospect.location
        };
        
        for (const [placeholder, value] of Object.entries(replacements)) {
            message = message.replace(new RegExp(placeholder, 'g'), value || '');
        }
        
        return message;
    }

    extractCompany(title) {
        // Extract company name from title (e.g., "CEO at Company Name")
        const match = title.match(/at\s+(.+)/i);
        return match ? match[1].trim() : '';
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

// Usage example
async function runLinkedInOutreach() {
    const automation = new LinkedInAutomation({
        email: 'your-linkedin-email@gmail.com',
        password: 'your-linkedin-password'
    });
    
    await automation.initialize();
    
    if (await automation.login()) {
        // Search for prospects
        const prospects = await automation.searchProspects('coffee shop owner Indianapolis', {
            connectionDegree: 'S', // 2nd degree connections
            location: 'Greater Indianapolis'
        });
        
        console.log(`Found ${prospects.length} prospects`);
        
        // Message template
        const messageTemplate = `Hi {name},

I noticed you're in the coffee business in {location}. I help coffee shop owners automate their social media presence to save 10+ hours per week.

We recently helped The Daily Grind triple their social engagement while cutting their posting time by 90%.

Would you be open to a quick chat about how this could work for your business?

Best,
Renato`;
        
        // Run outreach campaign
        const results = await automation.runOutreachCampaign(prospects.slice(0, 10), messageTemplate);
        
        console.log('Campaign Results:', results);
        
        // Save results
        const fs = require('fs');
        fs.writeFileSync('linkedin_outreach_results.json', JSON.stringify(results, null, 2));
    }
    
    await automation.close();
}

module.exports = LinkedInAutomation;

// Run if executed directly
if (require.main === module) {
    runLinkedInOutreach().catch(console.error);
}