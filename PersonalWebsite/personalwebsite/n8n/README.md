# n8n Workflows for AI-Daily

## Overview
This directory contains n8n workflow exports for the complete AI-Daily content pipeline.

## Workflow Components

1. **scout_ingest.json** - Discovers and ingests content from multiple sources
2. **ranker_score.json** - Scores content based on freshness, impact, replicability
3. **briefs_to_telegram.json** - Sends briefs to Telegram for quick review
4. **draft_kit_generate.json** - Creates full content kit (IG, blog, X hooks)
5. **similarity_check.json** - Validates ≤25% overlap with sources
6. **approval_email_send.json** - Sends 7 PM approval emails
7. **scheduler_post.json** - Publishes approved content at scheduled times
8. **metrics_collect.json** - Gathers performance data from all platforms
9. **weekly_compiler.json** - Creates Sunday YouTube script compilation

## Import Instructions

1. Open n8n instance
2. Go to Workflows → Import
3. Select JSON file from this directory
4. Configure credentials for:
   - OpenAI/Anthropic/Perplexity
   - Google Sheets
   - Telegram Bot
   - Email service
   - Social platform APIs

## Environment Variables Required
```
N8N_WEBHOOK_URL=https://your-n8n.com/webhook
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_CHAT_ID=xxx
OPENAI_API_KEY=xxx
ANTHROPIC_API_KEY=xxx
GOOGLE_SHEETS_ID=xxx
EMAIL_API_KEY=xxx
```

## Timezone Configuration
All workflows use: `America/Indiana/Indianapolis` (US/Eastern)

## Cron Schedules
- Scout: Every 6 hours (2 AM, 8 AM, 2 PM, 8 PM)
- Approval Email: Daily at 7:00 PM
- Buffer Check: Daily at 6:00 PM
- Publishing: As scheduled per content
- Metrics: Daily at 11:00 PM
- Weekly Compile: Sunday at 2:00 PM

## Testing
Each workflow includes test data. Use "Execute Workflow" with test flag before production.

## Error Handling
All workflows include error catches that:
1. Log to Google Sheets error tab
2. Send Telegram alert
3. Retry with exponential backoff
4. Fall back to manual approval

## Monitoring
Dashboard webhook: `{{N8N_WEBHOOK_URL}}/metrics`

Returns JSON with:
- Workflows run today
- Success/failure rates
- API usage
- Buffer status
- Next scheduled runs