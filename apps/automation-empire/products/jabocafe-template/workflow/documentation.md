# JaboCafe Social Media Automation Workflow
*Complete Documentation for n8n Implementation*

## Overview
Automates multi-platform social media posting from a single Instagram source, saving 10+ hours weekly for coffee shops and restaurants.

## Workflow Components

### 1. Instagram Trigger Node
**Type:** Instagram Business Trigger  
**Purpose:** Monitors for new posts on Instagram business account

**Configuration:**
```json
{
  "authentication": "OAuth2",
  "resource": "media",
  "operation": "getNew",
  "pollInterval": 5,
  "fields": [
    "id",
    "caption",
    "media_type",
    "media_url",
    "permalink",
    "timestamp"
  ]
}
```

**Output:** Triggers when new post detected, provides post data

### 2. Content Processor Node
**Type:** Code (JavaScript)  
**Purpose:** Extract and format content for different platforms

```javascript
const items = $input.all();
const output = [];

for (const item of items) {
  const post = item.json;
  
  // Extract hashtags
  const hashtags = post.caption.match(/#\w+/g) || [];
  
  // Clean caption for different platforms
  const cleanCaption = post.caption.replace(/#\w+/g, '').trim();
  
  // Platform-specific formatting
  output.push({
    instagram: {
      id: post.id,
      caption: post.caption,
      media_url: post.media_url,
      type: post.media_type
    },
    facebook: {
      message: cleanCaption + '\n\n' + hashtags.slice(0, 5).join(' '),
      link: post.permalink,
      picture: post.media_url
    },
    google: {
      summary: cleanCaption.substring(0, 1000),
      media: [{
        mediaFormat: post.media_type === 'VIDEO' ? 'VIDEO' : 'PHOTO',
        sourceUrl: post.media_url
      }],
      topicType: 'STANDARD'
    },
    twitter: {
      text: cleanCaption.substring(0, 240) + '... ' + hashtags.slice(0, 3).join(' '),
      media_ids: []  // Will be populated after upload
    },
    pinterest: {
      title: cleanCaption.split('\n')[0].substring(0, 100),
      description: cleanCaption,
      link: post.permalink,
      image_url: post.media_url
    }
  });
}

return output;
```

### 3. Image Optimizer Node
**Type:** HTTP Request + ImageMagick  
**Purpose:** Resize and optimize images for each platform

**Platform Requirements:**
- Facebook: 1200x630px
- Instagram: Already optimized
- Twitter: 1024x512px
- Pinterest: 1000x1500px (vertical)
- Google My Business: 1200x900px

```javascript
// Image processing logic
const sharp = require('sharp');

async function optimizeForPlatform(imageUrl, platform) {
  const dimensions = {
    facebook: { width: 1200, height: 630 },
    twitter: { width: 1024, height: 512 },
    pinterest: { width: 1000, height: 1500 },
    google: { width: 1200, height: 900 }
  };
  
  const dim = dimensions[platform];
  
  // Download and resize
  const buffer = await downloadImage(imageUrl);
  const optimized = await sharp(buffer)
    .resize(dim.width, dim.height, {
      fit: 'cover',
      position: 'center'
    })
    .jpeg({ quality: 85 })
    .toBuffer();
    
  return optimized;
}
```

### 4. Facebook Posting Node
**Type:** Facebook Graph API  
**Purpose:** Post to Facebook Page

**Configuration:**
```json
{
  "resource": "post",
  "operation": "create",
  "pageId": "{{$credentials.pageId}}",
  "message": "{{$node['Content Processor'].json.facebook.message}}",
  "link": "{{$node['Content Processor'].json.facebook.link}}",
  "picture": "{{$node['Content Processor'].json.facebook.picture}}"
}
```

### 5. Google My Business Node
**Type:** Google Business Profile API  
**Purpose:** Create local post on Google

**Configuration:**
```json
{
  "resource": "localPost",
  "operation": "create",
  "accountId": "{{$credentials.accountId}}",
  "locationId": "{{$credentials.locationId}}",
  "summary": "{{$node['Content Processor'].json.google.summary}}",
  "media": "{{$node['Content Processor'].json.google.media}}",
  "topicType": "STANDARD"
}
```

### 6. Twitter/X Posting Node
**Type:** Twitter API v2  
**Purpose:** Post tweet with media

**Two-step process:**
1. Upload media
2. Create tweet with media_ids

```javascript
// Step 1: Upload media
const mediaUpload = {
  resource: 'media',
  operation: 'upload',
  media: "{{$binary.data}}"
};

// Step 2: Create tweet
const tweet = {
  resource: 'tweet',
  operation: 'create',
  text: "{{$node['Content Processor'].json.twitter.text}}",
  media: {
    media_ids: ["{{$node['Media Upload'].json.media_id}}"]
  }
};
```

### 7. Pinterest Posting Node
**Type:** Pinterest API  
**Purpose:** Create pin on business board

**Configuration:**
```json
{
  "resource": "pin",
  "operation": "create",
  "boardId": "{{$credentials.boardId}}",
  "title": "{{$node['Content Processor'].json.pinterest.title}}",
  "description": "{{$node['Content Processor'].json.pinterest.description}}",
  "link": "{{$node['Content Processor'].json.pinterest.link}}",
  "image_url": "{{$node['Content Processor'].json.pinterest.image_url}}"
}
```

### 8. TikTok Posting Node (Optional)
**Type:** TikTok API  
**Purpose:** Cross-post video content

**Note:** Only processes video content
```json
{
  "resource": "video",
  "operation": "publish",
  "video_url": "{{$node['Content Processor'].json.instagram.media_url}}",
  "caption": "{{$node['Content Processor'].json.instagram.caption}}",
  "privacy_level": "PUBLIC_TO_EVERYONE"
}
```

### 9. Analytics Tracker Node
**Type:** Database (PostgreSQL/Supabase)  
**Purpose:** Track posting success and metrics

```sql
INSERT INTO social_posts (
  instagram_id,
  caption,
  media_url,
  posted_platforms,
  posted_at,
  business_id
) VALUES (
  $1, $2, $3, $4, NOW(), $5
) RETURNING *;
```

### 10. Error Handler Node
**Type:** Error Workflow  
**Purpose:** Handle and log failures

```javascript
// Error handling logic
const errors = [];

// Check each platform result
const platforms = ['facebook', 'google', 'twitter', 'pinterest'];
for (const platform of platforms) {
  const node = $node[platform + '_post'];
  if (node.error) {
    errors.push({
      platform: platform,
      error: node.error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// If errors, send notification
if (errors.length > 0) {
  // Send email or Slack notification
  await sendNotification({
    subject: 'Social Media Posting Errors',
    errors: errors,
    post_id: $node['Instagram Trigger'].json.id
  });
}

return errors;
```

## Platform-Specific Configurations

### Instagram Business Account
1. Convert to Business/Creator account
2. Connect to Facebook Page
3. Generate access token
4. Set up webhook for real-time updates

### Facebook Page
1. Create Facebook App
2. Add Page permissions
3. Generate Page Access Token
4. Configure webhook endpoints

### Google My Business
1. Enable GMB API
2. Create service account
3. Add location management permissions
4. Generate API credentials

### Twitter/X
1. Apply for Developer Account
2. Create App with v2 access
3. Generate OAuth 2.0 tokens
4. Configure read/write permissions

### Pinterest Business
1. Create Business account
2. Generate App ID and Secret
3. Create board for posts
4. Generate access token

## Scheduling & Timing

### Optimal Posting Times by Platform
```javascript
const optimalTimes = {
  facebook: {
    weekday: ['9:00', '13:00', '16:00'],
    weekend: ['12:00', '14:00']
  },
  google: {
    weekday: ['8:00', '12:00', '17:00'],
    weekend: ['10:00', '15:00']
  },
  twitter: {
    weekday: ['8:00', '12:00', '17:00', '21:00'],
    weekend: ['10:00', '14:00', '20:00']
  },
  pinterest: {
    weekday: ['14:00', '21:00'],
    weekend: ['14:00', '20:00']
  }
};
```

### Delay Node Configuration
Add delays between platform posts to avoid rate limiting:
- Facebook: No delay
- Google: 2-second delay
- Twitter: 1-second delay
- Pinterest: 3-second delay

## Testing Workflow

### Test Data Generator
```javascript
// Generate test post for workflow testing
const testPost = {
  id: 'test_' + Date.now(),
  caption: `☕ Today's special: Caramel Macchiato with house-made vanilla syrup! 

Perfect for this beautiful morning. Come grab yours before we sell out!

#coffee #coffeetime #caramelmacchiato #coffeeshop #localcoffee #${cityName}coffee`,
  media_type: 'IMAGE',
  media_url: 'https://example.com/test-image.jpg',
  permalink: 'https://instagram.com/p/test123',
  timestamp: new Date().toISOString()
};

return testPost;
```

## Monitoring & Maintenance

### Health Check Workflow
Runs daily to verify all connections:

```javascript
const healthChecks = {
  instagram: await checkInstagramAPI(),
  facebook: await checkFacebookAPI(),
  google: await checkGoogleAPI(),
  twitter: await checkTwitterAPI(),
  pinterest: await checkPinterestAPI()
};

const failures = Object.entries(healthChecks)
  .filter(([platform, status]) => !status)
  .map(([platform]) => platform);

if (failures.length > 0) {
  await sendAlert({
    message: `API Connection Failures: ${failures.join(', ')}`,
    severity: 'high'
  });
}
```

### Performance Metrics
Track and report weekly:
- Posts processed
- Success rate by platform
- Average processing time
- Error frequency
- Engagement metrics (if available)

## Troubleshooting Guide

### Common Issues & Solutions

**Instagram posts not triggering:**
- Check webhook subscription
- Verify Business account status
- Refresh access token

**Facebook posting fails:**
- Check Page permissions
- Verify token hasn't expired
- Check content policy compliance

**Google My Business errors:**
- Verify location is verified
- Check API quotas
- Ensure service account has access

**Image upload failures:**
- Check file size limits
- Verify image format support
- Check CDN/storage availability

**Rate limiting:**
- Implement exponential backoff
- Add platform-specific delays
- Use queue system for high volume

## Advanced Features

### A/B Testing Captions
```javascript
// Test different caption styles
const captionVariants = {
  A: originalCaption,
  B: generateEmojiRichCaption(originalCaption),
  C: generateQuestionCaption(originalCaption)
};

// Randomly select variant
const variant = captionVariants[['A','B','C'][Math.floor(Math.random() * 3)]];

// Track which variant was used
await trackVariant(post.id, variant);
```

### Hashtag Optimization
```javascript
// Analyze and optimize hashtags
function optimizeHashtags(hashtags, platform) {
  const limits = {
    instagram: 30,
    facebook: 5,
    twitter: 3,
    pinterest: 20
  };
  
  // Sort by relevance/popularity
  const sorted = hashtags.sort((a, b) => 
    getHashtagScore(b) - getHashtagScore(a)
  );
  
  return sorted.slice(0, limits[platform]);
}
```

### Multi-Language Support
```javascript
// Detect language and translate if needed
const detectLanguage = require('detect-language');
const translate = require('google-translate');

async function prepareMultilingualPost(caption) {
  const language = await detectLanguage(caption);
  
  if (language !== 'en') {
    const englishCaption = await translate(caption, 'en');
    return {
      original: caption,
      english: englishCaption,
      language: language
    };
  }
  
  return { original: caption, english: caption, language: 'en' };
}
```

## ROI Calculation

### Time Savings Formula
```
Manual Time per Post = 5 platforms × 5 minutes = 25 minutes
Automated Time = 0 minutes
Daily Savings = 25 minutes
Monthly Savings = 25 × 30 = 750 minutes = 12.5 hours
Hourly Rate = $25
Monthly Value = 12.5 × $25 = $312.50
```

### Reach Multiplication
```
Single Platform Reach = 1,000 views
Multi-Platform Reach = 5,000 views
Increase = 400%
Estimated New Customers = 20/month
Average Customer Value = $50
Monthly Revenue Increase = $1,000
```

## Client Onboarding Checklist

- [ ] Collect all platform credentials
- [ ] Set up Instagram Business account
- [ ] Connect Facebook Page
- [ ] Verify Google My Business
- [ ] Create Pinterest board
- [ ] Install n8n instance
- [ ] Import workflow template
- [ ] Configure credentials
- [ ] Test with sample post
- [ ] Set up monitoring alerts
- [ ] Train client on system
- [ ] Schedule follow-up call

## Support & Maintenance

### Monthly Tasks
- Review error logs
- Update API tokens
- Check platform changes
- Optimize posting times
- Generate performance report

### Quarterly Tasks
- Update workflow logic
- Add new platform support
- Review and optimize costs
- Client satisfaction survey

## Pricing Justification

**Setup ($497):**
- 4 hours configuration
- Platform integration
- Custom optimization
- Testing & training

**Monthly ($97):**
- Monitoring & alerts
- Token refresh
- Minor adjustments
- Monthly report
- Support access

**ROI: 300%+ in first month from time savings alone**