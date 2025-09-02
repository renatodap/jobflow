// ContentMachine API Module
// Handles platform-specific content optimization with AI

class ContentMachine {
    constructor(config = {}) {
        this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;
        this.webhookUrl = config.webhookUrl || 'http://localhost:5678/webhook/content-publish';
        this.platforms = {
            twitter: { charLimit: 280, emoji: '🐦' },
            linkedin: { charLimit: 3000, emoji: '💼' },
            facebook: { charLimit: 63206, emoji: '👥' },
            instagram: { charLimit: 2200, emoji: '📸' },
            tiktok: { charLimit: 150, emoji: '🎵' }
        };
    }

    // Main content generation method
    async generateContent(input) {
        const { 
            mainContent, 
            contentType = 'announcement',
            keyPoints = '',
            hashtags = '',
            platforms = ['twitter', 'linkedin', 'facebook', 'instagram', 'tiktok']
        } = input;

        const results = {};
        
        for (const platform of platforms) {
            if (this.platforms[platform]) {
                results[platform] = await this.optimizeForPlatform(
                    platform,
                    mainContent,
                    contentType,
                    keyPoints,
                    hashtags
                );
            }
        }

        return results;
    }

    // Platform-specific optimization
    async optimizeForPlatform(platform, content, type, keyPoints, hashtags) {
        const platformConfig = this.platforms[platform];
        
        switch(platform) {
            case 'twitter':
                return this.optimizeTwitter(content, hashtags, platformConfig.charLimit);
            
            case 'linkedin':
                return this.optimizeLinkedIn(content, type, keyPoints, hashtags);
            
            case 'facebook':
                return this.optimizeFacebook(content, type, keyPoints, hashtags);
            
            case 'instagram':
                return this.optimizeInstagram(content, hashtags);
            
            case 'tiktok':
                return this.optimizeTikTok(content, hashtags);
            
            default:
                return content;
        }
    }

    // Twitter optimization - concise and punchy
    optimizeTwitter(content, hashtags, limit) {
        let tweet = content;
        
        // Add hashtags if space allows
        const hashtagString = this.formatHashtags(hashtags, 3); // Max 3 hashtags for Twitter
        const combined = `${tweet}\n\n${hashtagString}`;
        
        if (combined.length <= limit) {
            tweet = combined;
        } else {
            // Truncate content to fit with hashtags
            const availableSpace = limit - hashtagString.length - 4; // 4 for "\n\n"
            tweet = `${content.substring(0, availableSpace)}...\n\n${hashtagString}`;
        }
        
        return tweet;
    }

    // LinkedIn optimization - professional and detailed
    optimizeLinkedIn(content, type, keyPoints, hashtags) {
        const title = this.getTitle(type);
        const points = this.formatKeyPoints(keyPoints);
        const tags = this.formatHashtags(hashtags, 5); // LinkedIn allows more hashtags
        
        let post = `${title}\n\n${content}`;
        
        if (points) {
            post += `\n\n${points}`;
        }
        
        post += `\n\n${tags}\n\n💬 What are your thoughts? Let's discuss in the comments!`;
        
        // Add professional CTA
        post += `\n\n🔔 Follow for more insights on automation and productivity.`;
        
        return post;
    }

    // Facebook optimization - engaging and conversational
    optimizeFacebook(content, type, keyPoints, hashtags) {
        const title = this.getTitle(type);
        const points = this.formatKeyPoints(keyPoints);
        const tags = this.formatHashtags(hashtags, 10); // Facebook allows many hashtags
        
        let post = `${title}\n\n${content}`;
        
        if (points) {
            post += `\n\n${points}`;
        }
        
        // Add engagement elements
        post += `\n\n👍 Like if you agree!\n💬 Share your experience in the comments!\n📤 Share with someone who needs to see this!`;
        
        post += `\n\n${tags}`;
        
        return post;
    }

    // Instagram optimization - visual and hashtag-heavy
    optimizeInstagram(content, hashtags) {
        const tags = this.formatHashtags(hashtags, 30); // Instagram allows up to 30 hashtags
        
        let post = content;
        post += '\n.\n.\n.'; // Instagram line breaks for readability
        post += `\n${tags}`;
        post += '\n\n📲 Link in bio for more details!';
        post += '\n\n#contentmachine #automation #socialmedia';
        
        return post;
    }

    // TikTok optimization - trendy and brief
    optimizeTikTok(content, hashtags) {
        const tags = this.formatHashtags(hashtags, 5, true); // Trendy hashtags only
        
        // Keep it super brief for TikTok
        let post = content.substring(0, 100);
        if (content.length > 100) {
            post += '...';
        }
        
        post += ` ${tags}`;
        post += ' #fyp #viral';
        
        return post;
    }

    // Helper methods
    getTitle(type) {
        const titles = {
            'announcement': '🚀 Exciting News!',
            'tip': '💡 Pro Tip',
            'story': '📖 Success Story',
            'promotion': '🎁 Special Offer',
            'engagement': '🤔 Question for You',
            'update': '📢 Important Update',
            'tutorial': '📚 Quick Tutorial',
            'behind-the-scenes': '🎬 Behind the Scenes'
        };
        return titles[type] || '📢 Update';
    }

    formatKeyPoints(keyPoints) {
        if (!keyPoints) return '';
        
        const points = keyPoints.split(',').map(p => p.trim()).filter(p => p);
        if (points.length === 0) return '';
        
        return points.map((point, index) => {
            const emojis = ['✅', '⭐', '🎯', '💡', '🚀', '🔥', '💪', '🌟'];
            return `${emojis[index % emojis.length]} ${point}`;
        }).join('\n');
    }

    formatHashtags(hashtags, limit = 10, trendy = false) {
        if (!hashtags) return '';
        
        // Split and clean hashtags
        let tags = hashtags.split(/[\s,]+/)
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
            .filter(tag => tag.length > 1);
        
        // Add trendy hashtags if requested
        if (trendy) {
            const trendyTags = ['#trending', '#viral', '#fyp', '#explore', '#discover'];
            tags = [...tags, ...trendyTags];
        }
        
        // Limit number of hashtags
        tags = tags.slice(0, limit);
        
        return tags.join(' ');
    }

    // Publish content via n8n webhook
    async publishContent(content, platforms) {
        try {
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    mainContent: content.mainContent,
                    contentType: content.contentType,
                    keyPoints: content.keyPoints,
                    hashtags: content.hashtags,
                    platforms: platforms
                })
            });

            if (!response.ok) {
                throw new Error(`Publishing failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error publishing content:', error);
            throw error;
        }
    }

    // Analyze content performance (mock for now)
    analyzePerformance(content) {
        return {
            readabilityScore: Math.floor(Math.random() * 30) + 70,
            engagementPrediction: Math.floor(Math.random() * 40) + 60,
            viralPotential: Math.floor(Math.random() * 100),
            suggestions: [
                'Add a question to increase engagement',
                'Include trending hashtags for better reach',
                'Consider adding emojis for visual appeal'
            ]
        };
    }

    // Schedule content for later
    scheduleContent(content, platforms, scheduledTime) {
        // This would integrate with a scheduling service
        console.log(`Content scheduled for ${scheduledTime}`);
        return {
            id: `schedule_${Date.now()}`,
            content,
            platforms,
            scheduledTime,
            status: 'scheduled'
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentMachine;
}

// Browser usage
if (typeof window !== 'undefined') {
    window.ContentMachine = ContentMachine;
}