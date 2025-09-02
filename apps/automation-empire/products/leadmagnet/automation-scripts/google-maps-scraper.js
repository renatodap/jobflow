// Google Maps Lead Scraper
// Finds businesses automatically from Google Maps

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

class GoogleMapsScraper {
    constructor() {
        this.browser = null;
        this.page = null;
    }

    async initialize() {
        this.browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1366, height: 768 });
    }

    async searchBusinesses(query, location, maxResults = 100) {
        const searchQuery = `${query} in ${location}`;
        const url = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
        
        await this.page.goto(url, { waitUntil: 'networkidle2' });
        await this.delay(3000);

        const businesses = [];
        let previousHeight = 0;
        
        // Scroll to load more results
        while (businesses.length < maxResults) {
            const resultsContainer = await this.page.$('[role="feed"]');
            if (!resultsContainer) break;

            // Get current results
            const newBusinesses = await this.extractBusinesses();
            
            // Add only unique businesses
            for (const business of newBusinesses) {
                if (!businesses.find(b => b.name === business.name)) {
                    businesses.push(business);
                }
            }

            // Scroll down
            await this.page.evaluate(() => {
                const feed = document.querySelector('[role="feed"]');
                if (feed) feed.scrollTop = feed.scrollHeight;
            });

            await this.delay(2000);

            // Check if we've reached the end
            const currentHeight = await this.page.evaluate(() => {
                const feed = document.querySelector('[role="feed"]');
                return feed ? feed.scrollHeight : 0;
            });

            if (currentHeight === previousHeight) break;
            previousHeight = currentHeight;
        }

        return businesses.slice(0, maxResults);
    }

    async extractBusinesses() {
        return await this.page.evaluate(() => {
            const businesses = [];
            const cards = document.querySelectorAll('[role="feed"] > div > div[jsaction]');
            
            cards.forEach(card => {
                try {
                    const nameElement = card.querySelector('[class*="fontHeadlineSmall"]');
                    const ratingElement = card.querySelector('[role="img"][aria-label*="stars"]');
                    const reviewCountElement = card.querySelector('[aria-label*="reviews"]');
                    const addressElement = card.querySelector('[class*="fontBodyMedium"]:not([aria-label])');
                    const websiteElement = card.querySelector('a[data-value*="Website"]');
                    const phoneElement = card.querySelector('[data-tooltip*="phone"]');

                    if (nameElement) {
                        const business = {
                            name: nameElement.textContent.trim(),
                            rating: ratingElement ? parseFloat(ratingElement.getAttribute('aria-label').match(/[\d.]+/)[0]) : null,
                            reviewCount: reviewCountElement ? parseInt(reviewCountElement.textContent.match(/\d+/)[0]) : 0,
                            address: addressElement ? addressElement.textContent.trim() : '',
                            hasWebsite: !!websiteElement,
                            hasPhone: !!phoneElement
                        };
                        businesses.push(business);
                    }
                } catch (e) {
                    console.error('Error extracting business:', e);
                }
            });
            
            return businesses;
        });
    }

    async getBusinessDetails(businessName) {
        // Click on the business to get more details
        const businessCard = await this.page.evaluate((name) => {
            const cards = document.querySelectorAll('[role="feed"] > div > div[jsaction]');
            for (const card of cards) {
                const nameEl = card.querySelector('[class*="fontHeadlineSmall"]');
                if (nameEl && nameEl.textContent.includes(name)) {
                    card.click();
                    return true;
                }
            }
            return false;
        }, businessName);

        if (!businessCard) return null;

        await this.delay(2000);

        // Extract detailed information
        const details = await this.page.evaluate(() => {
            const getTextContent = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.textContent.trim() : null;
            };

            const getLinkHref = (selector) => {
                const el = document.querySelector(selector);
                return el ? el.href : null;
            };

            return {
                name: getTextContent('h1'),
                phone: getTextContent('[data-tooltip*="phone"]'),
                website: getLinkHref('a[data-value*="Website"]'),
                address: getTextContent('[data-item-id*="address"]'),
                hours: getTextContent('[aria-label*="Hours"]'),
                instagram: getLinkHref('a[href*="instagram.com"]'),
                facebook: getLinkHref('a[href*="facebook.com"]')
            };
        });

        return details;
    }

    async findEmailFromWebsite(websiteUrl) {
        if (!websiteUrl) return null;

        try {
            const emailPage = await this.browser.newPage();
            await emailPage.goto(websiteUrl, { waitUntil: 'networkidle2', timeout: 10000 });
            
            // Look for email addresses on the page
            const emails = await emailPage.evaluate(() => {
                const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
                const pageText = document.body.innerText;
                const foundEmails = pageText.match(emailRegex) || [];
                
                // Filter out common non-business emails
                return foundEmails.filter(email => 
                    !email.includes('example.com') && 
                    !email.includes('email.com') &&
                    !email.includes('yoursite.com')
                );
            });

            await emailPage.close();
            return emails.length > 0 ? emails[0] : null;
        } catch (e) {
            console.error('Error finding email:', e);
            return null;
        }
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
async function findLeads() {
    const scraper = new GoogleMapsScraper();
    await scraper.initialize();

    try {
        // Search for coffee shops in Indianapolis
        const businesses = await scraper.searchBusinesses('coffee shops', 'Indianapolis', 50);
        
        console.log(`Found ${businesses.length} businesses`);
        
        // Get detailed info for top businesses
        const detailedLeads = [];
        for (const business of businesses.slice(0, 10)) {
            console.log(`Getting details for ${business.name}...`);
            const details = await scraper.getBusinessDetails(business.name);
            
            if (details && details.website) {
                details.email = await scraper.findEmailFromWebsite(details.website);
            }
            
            detailedLeads.push({
                ...business,
                ...details
            });
            
            await scraper.delay(2000); // Be respectful with requests
        }

        // Save to JSON
        const fs = require('fs');
        fs.writeFileSync('leads.json', JSON.stringify(detailedLeads, null, 2));
        console.log('Leads saved to leads.json');

    } finally {
        await scraper.close();
    }
}

module.exports = GoogleMapsScraper;

// Run if executed directly
if (require.main === module) {
    findLeads().catch(console.error);
}