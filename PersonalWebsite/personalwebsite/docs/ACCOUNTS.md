# Required Accounts Checklist

## Analytics & Monitoring
- [ ] **Google Analytics 4**
  - Property ID: `ENV_REQUIRED(GA4_MEASUREMENT_ID)`
  - Domain: renatodap.me
  - Enable Enhanced Measurement
  - Set up Conversions: Newsletter signup, Blog time >2min

- [ ] **Vercel**
  - Project: personalwebsite
  - Domain: renatodap.me (configure DNS)
  - Environment Variables: Add all API keys
  - Analytics: Enable Web Vitals

## AI & Content Generation
- [ ] **Perplexity API**
  - Key: `ENV_REQUIRED(PERPLEXITY_API_KEY)`
  - Plan: Pro API ($20/mo minimum)
  - Usage: Content scouting, fact-checking

- [ ] **OpenAI API**
  - Key: `ENV_REQUIRED(OPENAI_API_KEY)`
  - Model: GPT-4 for content, GPT-3.5 for classification
  - Usage limit: Set $50/mo cap initially

- [ ] **Anthropic Claude API**
  - Key: `ENV_REQUIRED(ANTHROPIC_API_KEY)`
  - Model: Claude 3 Opus for complex synthesis
  - Usage: High-value content generation

## Automation & Workflows
- [ ] **n8n Cloud** (or self-hosted)
  - Instance URL: `ENV_REQUIRED(N8N_WEBHOOK_URL)`
  - Credentials: Configure all API connections
  - Timezone: America/Indiana/Indianapolis

- [ ] **Google Cloud Project**
  - Project ID: `ENV_REQUIRED(GCP_PROJECT_ID)`
  - Enable APIs: Sheets, Drive, Gmail
  - Service Account: `ENV_REQUIRED(GCP_SERVICE_ACCOUNT_JSON)`
  - Sheets: Create Content_Pipeline spreadsheet

## Communication Channels
- [ ] **Telegram Bot**
  - Bot Token: `ENV_REQUIRED(TELEGRAM_BOT_TOKEN)`
  - Bot Username: @RenatoDailyAIBot
  - Commands: /approve, /buffer, /metrics, /help
  - Your Chat ID: `ENV_REQUIRED(TELEGRAM_CHAT_ID)`

- [ ] **Email Service** (SendGrid/Resend/AWS SES)
  - API Key: `ENV_REQUIRED(EMAIL_API_KEY)`
  - From Address: ai-daily@renatodap.me
  - Verified Domain: renatodap.me
  - Templates: Approval, Welcome, Weekly Digest

## Social Platforms
- [ ] **Instagram Business**
  - Handle: @renatodailyai (check availability)
  - Convert to Business/Creator account
  - Facebook Page: Link for API access
  - Graph API Token: `ENV_REQUIRED(IG_ACCESS_TOKEN)`

- [ ] **X (Twitter) Developer**
  - API Key: `ENV_REQUIRED(X_API_KEY)`
  - API Secret: `ENV_REQUIRED(X_API_SECRET)`
  - Access Token: `ENV_REQUIRED(X_ACCESS_TOKEN)`
  - Access Secret: `ENV_REQUIRED(X_ACCESS_SECRET)`
  - Elevated Access: Apply for write permissions

- [ ] **LinkedIn**
  - Page/Profile API: Limited automation options
  - Consider: Native posting only (manual)
  - Alternative: Use LinkedIn Share API for links

- [ ] **YouTube**
  - Channel: Create "Renato Daily AI" channel
  - API Key: `ENV_REQUIRED(YOUTUBE_API_KEY)`
  - Upload automation: Via YouTube Data API v3

## Development & Testing
- [ ] **GitHub**
  - Repo: Set to private initially
  - Actions Secrets: Add all ENV variables
  - Branch Protection: main branch

- [ ] **Supabase** (optional for data)
  - Project URL: `ENV_REQUIRED(SUPABASE_URL)`
  - Anon Key: `ENV_REQUIRED(SUPABASE_ANON_KEY)`
  - Tables: posts, metrics, approvals, buffer

## Domain & Hosting
- [ ] **Domain Registrar**
  - Domain: renatodap.me
  - DNS: Point to Vercel
  - Email: Configure MX records if needed

- [ ] **CDN/Images**
  - Cloudinary or Vercel Image Optimization
  - API Key: `ENV_REQUIRED(CDN_API_KEY)` (if using Cloudinary)

## Monitoring & Alerts
- [ ] **Uptime Monitor** (UptimeRobot/Pingdom)
  - Monitor: renatodap.me
  - Alert to: renatodaprado@gmail.com
  - Check interval: 5 minutes

- [ ] **Error Tracking** (Sentry)
  - DSN: `ENV_REQUIRED(SENTRY_DSN)`
  - Project: ai-daily
  - Alerts: Critical errors only

## Financial
- [ ] **Stripe** (for future monetization)
  - Publishable Key: `ENV_REQUIRED(STRIPE_PUBLISHABLE_KEY)`
  - Secret Key: `ENV_REQUIRED(STRIPE_SECRET_KEY)`
  - Products: Newsletter Premium, Courses

## Setup Priority Order
1. Vercel + Domain (deploy site)
2. Google Analytics (measure from day 1)
3. Telegram Bot (approval flow)
4. AI APIs (content generation)
5. n8n + Google Sheets (automation)
6. Email service (approval emails)
7. Social platforms (distribution)
8. Monitoring (once stable)

## Security Notes
- Use separate email for service accounts
- Enable 2FA on all accounts
- Rotate API keys quarterly
- Never commit secrets to git
- Use Vercel env vars for production

---

*Estimated setup time: 4-6 hours*
*Monthly cost: ~$100-150 initially*