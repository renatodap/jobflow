# AI-Daily Posting Schedule Specification

## Daily Schedule (US/Eastern Time)

### Morning
- **8:00 AM** - Blog post publishes
- **8:05 AM** - Blog link auto-shared to X

### Afternoon  
- **12:30 PM** - Instagram carousel posts
- **3:00 PM** - X A/B test hooks posted
- **3:30 PM** - First metrics check
- **4:00 PM** - Delete losing hook, winner continues

### Evening
- **6:00 PM** - Buffer check automation
- **7:00 PM** - Approval email sent
- **10:30 PM** - Approval deadline (HOLD if no response)
- **11:00 PM** - Metrics collection run

## Weekly Schedule

### Monday
- Standard daily posts
- Week recap metrics email

### Tuesday
- Standard daily posts
- **LinkedIn native post** (8-10 AM flexible)

### Wednesday
- Standard daily posts
- **YouTube video publishes** (10:00 AM)

### Thursday
- Standard daily posts

### Friday
- Standard daily posts
- **LinkedIn native post** (8-10 AM flexible)

### Saturday
- Standard daily posts
- Mini-validation experiment run

### Sunday
- Standard daily posts
- **2:00 PM** - YouTube script compilation
- **7:00 PM** - Weekly planning session

## Buffer Management Rules

### Target Levels
- **Optimal:** 3 days
- **Minimum:** 2 days  
- **Maximum:** 6 days
- **Warning:** <2 days
- **Critical:** <1 day

### Auto-Adjustments

**When buffer <2 days:**
1. Send TWO approval emails at 7 PM
2. Lower quality threshold to 65 (from 70)
3. Trigger emergency scout
4. Activate recycling of top performers

**When buffer >5 days:**
1. Raise quality threshold to 75
2. Reduce scouting frequency
3. Focus on experimental content

## HOLD Conditions

Content automatically held if:
- No approval by 10:30 PM
- Quality score <60
- Similarity >25% with any source
- Missing required assets (cover image)
- API errors during generation

## Publishing Priority

When multiple items ready:
1. Time-sensitive content (news/updates)
2. High engagement predicted (>85 score)
3. Balanced type distribution (rotate T1-T5)
4. Fill gaps in topic coverage

## Platform-Specific Rules

### Blog
- Publish exactly at 8:00 AM
- URL format: `/blog/yyyy/mm/slug`
- Auto-generate og:image if missing
- Ping Google after publish

### Instagram
- Post between 12:00-1:00 PM (flexible)
- 9 slides maximum
- Alt text on all images
- First comment with hashtags

### X (Twitter)
- A/B test at 3:00 PM sharp
- 2-minute gap between hooks
- Delete loser at 4:00 PM
- Thread continuation optional

### LinkedIn
- Tuesday/Friday only
- Manual review recommended
- Native post (not link share)
- Professional tone adjustment

### YouTube
- Wednesday 10:00 AM sharp
- Thumbnail ready 24h prior
- Description with timestamps
- End screen to blog

## Holiday Adjustments

**Major holidays** (skip or pre-schedule):
- New Year's Day
- July 4th
- Thanksgiving
- Christmas

**Minor holidays** (post but adjust tone):
- Memorial Day
- Labor Day
- Presidents Day
- MLK Day

## Failure Recovery

### If blog fails to post:
1. Retry every 5 min for 30 min
2. If still failing, email alert
3. Hold all dependent posts
4. Manual intervention required

### If approval not received:
1. Check email delivery
2. Send Telegram backup
3. If no response by 11 PM, hold
4. Resume with next day's content

### If buffer depleted:
1. Immediate emergency scout
2. Recycle top 5 performers
3. Manual writing session alert
4. Lower all thresholds by 10 points

## Metrics Tracking

### Per-post tracking:
- Time to approval
- Engagement rate first hour
- Peak engagement time
- Share/save ratio

### Daily rollup:
- Total impressions
- Engagement rate
- New followers
- Click-through rate

### Weekly analysis:
- Best performing type
- Optimal posting times
- Topic performance
- Platform comparison

## Scheduling Algorithm

```javascript
function calculatePublishTime(content) {
  const baseTime = {
    blog: "08:00",
    instagram: "12:30",
    twitter: "15:00",
    linkedin: "09:00",
    youtube: "10:00"
  };
  
  // Adjust for engagement history
  const historicalBest = getHistoricalBestTime(content.type);
  
  // Avoid conflicts
  const conflicts = checkScheduleConflicts(proposedTime);
  
  // Return optimized time
  return optimizeTime(baseTime, historicalBest, conflicts);
}
```

## Queue Management

### Priority Levels
1. **Urgent** - Publishes next slot
2. **High** - Within 24 hours
3. **Normal** - Standard buffer
4. **Low** - Filler content
5. **Evergreen** - No time sensitivity

### Batch Processing
- Process approvals in batches
- Generate content kits in parallel
- Schedule week's posts Sunday evening
- Pre-generate covers for efficiency

## Integration Points

- **n8n Workflows:** All scheduling via workflows
- **Google Sheets:** Schedule stored in `Schedule` tab
- **Telegram Bot:** Real-time schedule queries
- **Calendar API:** Optional Google Calendar sync
- **Monitoring:** Dashboard with live schedule view

---

*This schedule optimizes for engagement while maintaining sustainable buffer levels and allowing flexibility for breaking content.*