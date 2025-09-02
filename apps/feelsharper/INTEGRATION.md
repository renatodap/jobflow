# **INTEGRATION STRATEGY: FEEL SHARPER ECOSYSTEM**

## **A) INTEGRATION MATRIX**

| **Vendor/Platform** | **Data/Actions** | **Why (Habit/Distribution/Moat)** | **User Stories** | **Effort** | **Risk** | **Auth Model** | **Webhooks** | **Rate Limits** | **SDK/Lib** | **ToS Constraints** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **MUST-SHIP (0-90d)** |  |  |  |  |  |  |  |  |  |  |
| Apple HealthKit + Watch | Workouts, HR/HRV, sleep, steps; write plans | **Habit**: 1-tap sync, instant coach feedback; **Moat**: Deep biometric insights | "My watch workout auto-appears with coach analysis" | M | Low | HealthKit local | No | Device-limited | HealthKit | Usage description required |
| Google Fit (Android) | Workouts, HR, sleep, steps | **Habit**: Android parity for seamless logging | "My Pixel tracks steps, coach adapts daily plan" | M | Low | OAuth 2.0 | Yes | 1000 req/day | Google Fit API | Standard OAuth |
| Garmin Connect | Activities, HR, sleep, stress | **Habit**: Athlete-grade data → precise recovery; **Moat**: Pro athlete insights | "My Garmin data shows I need recovery day" | L | Med | OAuth 2.0 | Yes | 200 req/min | Garmin Connect IQ | Dev approval needed |
| Strava | Import activities; auto-share summaries | **Distribution**: Social proof, viral shares; **Habit**: Seamless activity import | "My run imports, coach adapts, friends see progress" | M | Low | OAuth 2.0 | Yes | 600 req/15min | Strava API v3 | No auto-posting without approval |
| Apple/Google Sign-In | Auth, profile | **Habit**: Frictionless onboarding | "Sign up in 2 taps" | S | Low | OAuth 2.0/OIDC | No | Standard | Platform SDKs | Platform guidelines |
| Push (APNs/FCM) | Notifications, deep links | **Habit**: Timely nudges, coach insights | "Get nudged when it's workout time" | M | Low | Certificate/Key | No | Platform limits | Platform SDKs | No spam, user consent |
| Stripe | Subscriptions, payments | **Moat**: Premium features, coach access | "Upgrade for advanced coach insights" | M | Low | API Keys | Yes | 100 req/sec | Stripe SDK | PCI compliance |
| Discord | Squad weekly digest webhook | **Distribution**: Community engagement | "Squad recap posts to our Discord weekly" | S | Low | Webhook URL | Yes | 50 req/sec | Discord.js | Bot approval for scale |
| **HIGH-ROI NEXT (90-180d)** |  |  |  |  |  |  |  |  |  |  |
| Oura Cloud | Sleep, HRV, readiness | **Moat**: Elite recovery insights, switching costs | "Oura shows I'm 85% ready, coach adjusts intensity" | L | Med | OAuth 2.0 | Yes | 5000 req/day | Oura API v2 | Health data sensitivity |
| Fitbit Web API | Activities, HR, sleep | **Habit**: Mass market device coverage | "My Fitbit sleep data improves coach recommendations" | M | Low | OAuth 2.0 | Yes | 150 req/hour | Fitbit SDK | Intraday data restrictions |
| WHOOP | Recovery/strain, HRV/RHR | **Moat**: Pro athlete recovery science | "WHOOP strain score prevents overtraining" | L | High | OAuth 2.0 | Yes | Unknown | WHOOP API | Limited dev access |
| Open Food Facts | Barcode nutrition DB | **Habit**: Instant macro logging we own | "Scan barcode, macros logged in 2 seconds" | M | Low | API Key | No | Reasonable | REST API | Open database |
| Weather + Location | Conditions, adapt outdoor plans | **Habit**: Contextual plan adaptation | "Rain detected, indoor workout suggested" | M | Low | API Key | No | 1000 req/day | OpenWeather | Location privacy |
| Google/Apple Calendar | Schedule workouts, nudges | **Habit**: Plan integration, smart timing | "Workouts locked in calendar, nudged optimally" | M | Med | OAuth 2.0 | Yes | Platform limits | Calendar APIs | Calendar access sensitive |
| **OPPORTUNISTIC** |  |  |  |  |  |  |  |  |  |  |
| TikTok/Instagram/X | Share handoff only | **Distribution**: Viral content, no auto-post | "Generate reel card, share to story manually" | S | Med | Share Intent | No | N/A | Native share | No auto-posting |
| Slack | Org team digests | **Distribution**: Workplace wellness | "Team fitness recap in #wellness channel" | S | Low | Webhook URL | Yes | 1 req/sec | Slack SDK | Workspace approval |

## **B) ARCHITECTURE & DATA FLOW**

`┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐│   Device/App    │    │  Feel Sharper    │    │   External      ││                 │    │                  │    │   Services      │├─────────────────┤    ├──────────────────┤    ├─────────────────┤│ HealthKit       │───▶│ Ingestion Layer  │◀───│ Strava API      ││ Google Fit      │    │                  │    │ Garmin Connect  ││ Manual Entry    │    │ ┌──────────────┐ │    │ Oura Cloud      │└─────────────────┘    │ │IngestionEvent│ │    │ Discord         │                       │ │Normalization │ │    └─────────────────┘                       │ └──────────────┘ │                       │        │         │                       │        ▼         │                       │ ┌──────────────┐ │                       │ │   Metrics    │ │                       │ │  Workout     │ │                       │ │  Sleep       │ │                       │ │  Nutrition   │ │                       │ │  Recovery    │ │                       │ └──────────────┘ │                       │        │         │                       │        ▼         │                       │ ┌──────────────┐ │                       │ │ Coach Engine │ │                       │ │  Insights    │ │                       │ │  Adaptations │ │                       │ └──────────────┘ │                       └──────────────────┘`

**File Structure:**

`lib/├── integrations/│   ├── core/│   │   ├── oauth.ts          # PKCE, token management│   │   ├── webhooks.ts       # Signature verification│   │   └── idempotency.ts    # Duplicate prevention│   ├── healthkit/│   │   ├── client.ts         # HealthKit wrapper│   │   ├── mapper.ts         # Data normalization│   │   └── sync.ts           # Background sync│   ├── strava/│   │   ├── client.ts         # Strava API client│   │   ├── mapper.ts         # Activity normalization│   │   └── webhooks.ts       # Webhook handlers│   └── garmin/│       ├── client.ts         # Garmin Connect API│       ├── mapper.ts         # Data transformation│       └── sync.ts           # Incremental syncapp/api/integrations/├── [provider]/│   ├── oauth/│   │   ├── start/route.ts    # OAuth initiation│   │   └── callback/route.ts # OAuth completion│   ├── webhook/route.ts      # Webhook receiver│   └── disconnect/route.ts   # Revoke integrationjobs/└── sync/    ├── healthkit.ts          # HealthKit sync job    ├── strava.ts             # Strava sync job    └── garmin.ts             # Garmin sync job`

## **C) SECURITY & PRIVACY**

**OAuth Implementation:**

- PKCE for all OAuth flows
- Encrypted token storage (AES-256)
- Rotating refresh tokens
- Least-privilege scopes
- Token expiration monitoring

**Webhook Security:**

- HMAC signature verification
- Replay protection (nonce + 5min TTL)
- Idempotency keys
- Rate limiting per provider

**Data Classification:**

- **PII**: User profile, email → encrypted, audit log
- **Health**: Biometrics, workouts → encrypted, retention policy
- **Usage**: App interactions → anonymized analytics

## **D) USER FLOWS & UX WIREFRAMES**

**Integrations Hub (**

```
/settings/integrations
```

**):**

`┌─────────────────────────────────────┐│ Connected Devices & Apps            │├─────────────────────────────────────┤│ 🍎 Apple Health        [Connected] ││ Last sync: 2 min ago               ││ Data: Workouts, Sleep, Heart Rate  ││ [⚙️ Settings] [🔌 Disconnect]      │├─────────────────────────────────────┤│ 🏃 Strava              [Connect]   ││ Import runs & rides automatically  ││ [🔗 Connect Account]               │├─────────────────────────────────────┤│ 💬 Discord             [Optional]  ││ Weekly squad recaps                ││ [🔗 Add to Squad]                  │└─────────────────────────────────────┘`

**Onboarding Integration Prompts:**

`iOS Users:┌─────────────────────────────────────┐│ 📱 Connect Apple Health             ││                                     ││ Get instant coach feedback on your  ││ workouts, sleep, and heart rate.    ││                                     ││ ✓ 1-tap workout logging             ││ ✓ Personalized recovery insights    ││ ✓ Your data stays on your device    ││                                     ││ [Connect Apple Health] [Skip]       │└─────────────────────────────────────┘Android Users:┌─────────────────────────────────────┐│ 🤖 Connect Google Fit               ││                                     ││ Automatically sync your fitness     ││ data for smarter coaching.          ││                                     ││ [Connect Google Fit] [Skip]         │└─────────────────────────────────────┘`

## **E) DELIVERY PLAN**

**PHASE 1 — FOUNDATIONS (Weeks 1-3)**

**Branch:**

```
feat/integrations-foundation
```

**Core Infrastructure:**

- Database schema (IntegrationAccount, IngestionEvent)
- OAuth utilities (PKCE, token encryption)
- Webhook verification system
- Integrations Hub UI
- Feature flags per provider

**PHASE 2 — HEALTH + STRAVA (Weeks 3-6)**

- HealthKit integration (iOS)
- Google Fit integration (Android)
- Strava OAuth + webhooks
- Background sync jobs
- Auto-share toggle for Strava

**PHASE 3 — GARMIN + DISCORD + NUTRITION (Weeks 6-9)**

- Garmin Connect integration
- Discord webhook for squad digests
- Open Food Facts barcode scanning
- Nutrition logging (owned data)

**PHASE 4 — RECOVERY + CONTEXT (Weeks 9-12)**

- Oura or Fitbit integration (pick highest ROI)
- Weather + Calendar context
- Map routes for outdoor sessions
- A/B test integration prompts

## **F) ACCEPTANCE CRITERIA**

✅ **Foundation:**

- Integrations Hub shows all providers with status
- OAuth flows complete with PKCE
- Tokens encrypted and stored securely
- Webhook signature verification working

✅ **Core Integrations:**

- HealthKit/Google Fit syncing workouts, sleep, HR
- Strava importing activities with optional auto-share
- Garmin Connect syncing with webhooks
- Discord posting squad weekly digests

✅ **Data Flow:**

- All data normalized to internal schema
- Background jobs respect rate limits
- Idempotent webhook processing
- Analytics events for all integration actions