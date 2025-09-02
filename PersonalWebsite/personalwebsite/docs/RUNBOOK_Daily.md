# Daily Operations Runbook

**Time Required:** 15-30 minutes  
**Owner:** Renato Dansieri de Almeida Prado  
**Timezone:** US/Eastern (America/Indiana/Indianapolis)

## Morning Check (8:00 AM ET) — 5 min

1. **Verify Today's Post Published**
   - Check blog at renatodap.me/blog
   - Confirm IG carousel posted at 12:30 PM (scheduled)
   - Verify no errors in monitoring dashboard

2. **Review Metrics**
   - Yesterday's blog views
   - IG engagement (saves, shares)
   - X impression from yesterday's A/B winner

3. **Check Buffer Status**
   - Current buffer: Target 3 days (floor 2, ceiling 6)
   - If <2 days: Flag for double approval tonight

## Afternoon Tasks (3:00-4:00 PM ET) — 10 min

1. **X (Twitter) A/B Test**
   - 3:00 PM: Post Hook A and Hook B
   - 3:30 PM: Check engagement
   - 4:00 PM: Delete loser, let winner run

2. **LinkedIn (Tuesday/Friday only)**
   - Post 120-180 word native update
   - Include 3 decision bullets
   - Link to relevant blog post

## Evening Approval (7:00 PM ET) — 10-15 min

1. **Review Approval Email**
   - Check email at 7:00 PM sharp
   - Contains: Tomorrow's IG slides, blog summary, X hooks

2. **Approval Decision Tree**
   ```
   Quality OK? 
   ├─ YES → Click "Approve"
   ├─ NEEDS TWEAK → Click "Tweak" + add notes
   └─ NO → Click "Decline" (auto-recycles in 14 days)
   ```

3. **Buffer Management**
   - If buffer <2: Review TWO approval emails
   - Elevate best brief for tomorrow morning
   - If no response by 10:30 PM: System HOLDs

## Quick Commands

**Telegram Bot Commands:**
- `/buffer` - Check current buffer status
- `/metrics` - Today's performance snapshot
- `/approve [id]` - Approve content via mobile
- `/help` - All available commands

**Emergency Overrides:**
- Hold all publishing: `/hold all`
- Rush publish: `/publish now [post-id]`
- Regenerate brief: `/regenerate [brief-id]`

## Common Issues & Fixes

**Post didn't publish:**
1. Check n8n workflow status
2. Verify API quotas not exceeded
3. Check approval timestamp (must be before 10:30 PM)

**Low engagement:**
1. Review hook quality in A/B tests
2. Check posting time consistency
3. Verify images rendering correctly

**Buffer running low:**
1. Trigger scout for more content: `/scout now`
2. Lower quality threshold temporarily (70→65)
3. Recycle high-performing old content

## Weekly Checkpoint (Sunday)

- Review week's top performers
- Adjust quality thresholds if needed
- Check API usage vs. budget
- Plan Tuesday/Friday LinkedIn topics
- Compile YouTube script bullets

## On-Call Escalation

**Level 1 (Self-service):**
- Check system dashboard
- Review recent approvals
- Verify API keys valid

**Level 2 (Automated alerts):**
- Email to renatodaprado@gmail.com
- Telegram notification
- n8n workflow error logs

**Level 3 (Manual intervention):**
- Access n8n dashboard directly
- Check Vercel deployment logs
- Review Google Sheets for data issues

## Time-Saving Tips

1. **Batch approve** on mobile while commuting
2. **Pre-write** LinkedIn bullets on Sunday
3. **Template** common tweaks in Telegram
4. **Bookmark** dashboard URLs
5. **Set calendar reminders** for 3:00 PM X posts

## Success Metrics

**Daily Minimums:**
- Blog: >100 views
- IG: >50 engagements
- X: >500 impressions
- Time spent: <20 minutes

**Red Flags:**
- Buffer <1 day
- 3 consecutive declines
- API errors >5% of requests
- Approval emails not arriving

---

*Remember: The system handles 90% automatically. Your job is quality control and strategic decisions.*