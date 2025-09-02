# 🚀 StudySharper Complete Deployment Guide

This guide will take you from the current state to a fully functional study app that students can use.

**Total Time Required: 4-6 hours**
**Cost: ~$20/month for AI (optional: can use free Ollama)**

---

## Phase 1: Supabase Setup (45 minutes)

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/login and click "New Project"
3. Configure:
   - **Project name**: `studysharper-prod`
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier (sufficient for 500+ users)
4. Click "Create Project" and wait ~2 minutes

### Step 2: Get Supabase Credentials
Once project is ready:
1. Go to Settings → API
2. Copy these values:
   ```
   Project URL: https://[your-project-id].supabase.co
   Anon/Public Key: eyJhbGc....[long string]
   Service Role Key: eyJhbGc....[different long string]
   ```
3. Save these for later

### Step 3: Configure Authentication
1. Go to Authentication → Providers
2. Enable "Email" provider (already enabled by default)
3. Enable "Google" provider:
   - Toggle Google to "ON"
   - You'll need Google OAuth credentials (see Step 4)

### Step 4: Set Up Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API:
   - Go to "APIs & Services" → "Enable APIs"
   - Search for "Google+ API" and enable it
4. Create OAuth credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "StudySharper"
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://[your-vercel-domain].vercel.app
     ```
   - Authorized redirect URIs:
     ```
     https://[your-project-id].supabase.co/auth/v1/callback
     ```
5. Copy the Client ID and Client Secret
6. Go back to Supabase Authentication → Providers → Google
7. Paste your Client ID and Client Secret
8. Click "Save"

### Step 5: Run Database Migrations
1. In your local terminal:
   ```bash
   cd studysharper
   
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref [your-project-id]
   # (Find project-id in Supabase dashboard Settings → General)
   
   # Push migrations
   supabase db push
   ```

2. Verify migrations:
   - Go to Supabase Dashboard → Table Editor
   - You should see tables: users, schools, courses, notes, etc.

---

## Phase 2: AI Provider Setup (30 minutes)

### Option A: OpenRouter (Recommended - Costs ~$20/month)
1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Sign up and add $20 credit
3. Go to Keys → Create New Key
4. Copy your API key

### Option B: Ollama (Free - Requires 8GB+ RAM)
1. Download Ollama from [https://ollama.ai](https://ollama.ai)
2. Install and run:
   ```bash
   # Install Ollama
   # Pull a model (3.8GB download)
   ollama pull llama2
   
   # Start Ollama server (runs on http://localhost:11434)
   ollama serve
   ```

### Option C: OpenAI (Alternative - $20-50/month)
1. Go to [https://platform.openai.com](https://platform.openai.com)
2. Create account and add payment method
3. Go to API Keys → Create New Secret Key
4. Copy your API key

---

## Phase 3: Vercel Deployment Configuration (30 minutes)

### Step 1: Configure Environment Variables in Vercel
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add these variables:

```bash
# Supabase (from Phase 1)
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...[your anon key]
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...[your service key]

# AI Provider (choose one from Phase 2)
OPENROUTER_API_KEY=sk-or-v1-[your-key]  # If using OpenRouter
# OR
OPENAI_API_KEY=sk-[your-key]  # If using OpenAI
# OR
OLLAMA_BASE_URL=http://localhost:11434  # If using Ollama locally

# Google OAuth (from Phase 1, Step 4)
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]

# App Configuration
NEXT_PUBLIC_APP_URL=https://[your-vercel-domain].vercel.app
NODE_ENV=production
```

### Step 2: Update Vercel Build Settings
1. Go to Settings → General
2. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
   - **Build Command**: `cd ../.. && pnpm build:packages && cd apps/web && next build`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install`

### Step 3: Redeploy
1. Go to Deployments
2. Click on the latest deployment
3. Click "Redeploy" → "Redeploy with existing Build Cache"

---

## Phase 4: Complete Missing Features (2-3 hours)

### Critical Feature #1: Fix Authentication Flow
Create `.env.local` file locally:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...[your anon key]
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...[your service key]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
```

Test locally:
```bash
pnpm dev
# Visit http://localhost:3000
# Try to sign in with Google
```

### Critical Feature #2: Enable File Processing
The file upload needs the AI to work. Test it:
1. Sign in to the app
2. Go to Dashboard
3. Upload a PDF
4. If it fails, check browser console for errors

### Critical Feature #3: Add Flashcard Review UI
```bash
# This needs to be coded - here's the quick version:
# Create a new file: apps/web/app/cards/review/page.tsx
```

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createSupabaseClient } from '@/lib/supabase'

export default function ReviewPage() {
  const [currentCard, setCurrentCard] = useState(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [cards, setCards] = useState([])
  
  useEffect(() => {
    loadCards()
  }, [])
  
  async function loadCards() {
    const supabase = createSupabaseClient()
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('next_review', new Date().toISOString().split('T')[0])
      .limit(20)
    
    if (data) {
      setCards(data)
      setCurrentCard(data[0])
    }
  }
  
  async function submitReview(quality: number) {
    // Implement SM-2 algorithm here
    const supabase = createSupabaseClient()
    
    // Update card with new interval
    await supabase
      .from('cards')
      .update({
        repetitions: currentCard.repetitions + 1,
        ease_factor: Math.max(1.3, currentCard.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))),
        interval: calculateNextInterval(currentCard, quality),
        next_review: calculateNextReviewDate(currentCard, quality)
      })
      .eq('id', currentCard.id)
    
    // Move to next card
    const nextIndex = cards.indexOf(currentCard) + 1
    if (nextIndex < cards.length) {
      setCurrentCard(cards[nextIndex])
      setShowAnswer(false)
    } else {
      // No more cards
      setCurrentCard(null)
    }
  }
  
  function calculateNextInterval(card: any, quality: number) {
    if (quality < 3) return 1
    if (card.repetitions === 0) return 1
    if (card.repetitions === 1) return 6
    return Math.round(card.interval * card.ease_factor)
  }
  
  function calculateNextReviewDate(card: any, quality: number) {
    const days = calculateNextInterval(card, quality)
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }
  
  if (!currentCard) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">No cards to review!</h1>
        <Button onClick={() => window.location.href = '/cards'}>
          Go to Cards
        </Button>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <div className="mb-4">
        <span className="text-sm text-gray-500">
          Card {cards.indexOf(currentCard) + 1} of {cards.length}
        </span>
      </div>
      
      <Card className="p-8 min-h-[300px] flex flex-col justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">{currentCard.front}</h2>
          
          {showAnswer && (
            <div className="mt-8 p-4 bg-gray-50 rounded">
              <p className="text-lg">{currentCard.back}</p>
            </div>
          )}
        </div>
      </Card>
      
      <div className="mt-6 flex justify-center gap-4">
        {!showAnswer ? (
          <Button 
            size="lg" 
            onClick={() => setShowAnswer(true)}
          >
            Show Answer
          </Button>
        ) : (
          <>
            <Button 
              variant="destructive" 
              onClick={() => submitReview(1)}
            >
              Again
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => submitReview(3)}
            >
              Hard
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => submitReview(4)}
            >
              Good
            </Button>
            <Button 
              variant="default" 
              onClick={() => submitReview(5)}
            >
              Easy
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
```

### Critical Feature #4: Add Study Timer
```bash
# Create: apps/web/components/study/study-timer.tsx
```

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Play, Pause, RotateCcw } from 'lucide-react'

export function StudyTimer() {
  const [seconds, setSeconds] = useState(25 * 60) // 25 minutes
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  
  useEffect(() => {
    let interval = null
    
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1)
      }, 1000)
    } else if (seconds === 0) {
      // Timer finished
      if (!isBreak) {
        // Start break
        setSeconds(5 * 60) // 5 minute break
        setIsBreak(true)
        alert('Time for a break!')
      } else {
        // Break finished
        setSeconds(25 * 60)
        setIsBreak(false)
        alert('Break over! Ready to study?')
      }
      setIsActive(false)
    }
    
    return () => clearInterval(interval)
  }, [isActive, seconds, isBreak])
  
  function toggle() {
    setIsActive(!isActive)
  }
  
  function reset() {
    setSeconds(25 * 60)
    setIsActive(false)
    setIsBreak(false)
  }
  
  function formatTime(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  return (
    <Card className="p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          {isBreak ? 'Break Time' : 'Study Session'}
        </h3>
        <div className="text-4xl font-mono font-bold mb-4">
          {formatTime(seconds)}
        </div>
        <div className="flex gap-2 justify-center">
          <Button onClick={toggle} size="lg">
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isActive ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={reset} variant="outline" size="lg">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </Card>
  )
}
```

Add to dashboard (`apps/web/app/dashboard/page.tsx`):
```typescript
import { StudyTimer } from '@/components/study/study-timer'

// Add this in the dashboard layout:
<StudyTimer />
```

---

## Phase 5: Testing Checklist (1 hour)

### Test These User Flows:

#### 1. Authentication
- [ ] Can create account with email
- [ ] Can sign in with Google
- [ ] Redirects to dashboard after login
- [ ] Can sign out

#### 2. File Upload
- [ ] Can upload PDF
- [ ] Shows processing status
- [ ] Creates embeddings (check Supabase table)
- [ ] Can ask questions about uploaded content

#### 3. Study Planning
- [ ] Can create a course
- [ ] Can generate study plan
- [ ] Shows study blocks in calendar view

#### 4. Flashcards
- [ ] Can create a deck
- [ ] Can add cards to deck
- [ ] Can review cards
- [ ] Spaced repetition intervals update

#### 5. Study Timer
- [ ] Timer counts down
- [ ] Break timer activates after session
- [ ] Can pause and resume

---

## Phase 6: Quick Fixes for Common Issues

### Issue: "Missing Supabase environment variables"
**Fix**: Make sure all env vars are added in Vercel with exact names

### Issue: Google Sign-in not working
**Fix**: 
1. Check redirect URI in Google Console matches Supabase URL exactly
2. Ensure Google+ API is enabled
3. Check browser console for specific error

### Issue: File upload fails
**Fix**:
1. Check AI provider is configured
2. Check browser console for errors
3. Verify Supabase storage bucket exists:
   ```sql
   -- Run in Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public) 
   VALUES ('notes', 'notes', false);
   ```

### Issue: No tables in database
**Fix**: Run migrations manually in Supabase SQL Editor:
1. Go to SQL Editor in Supabase
2. Copy contents of `supabase/migrations/20250812000001_initial_schema.sql`
3. Run it
4. Copy contents of `supabase/migrations/20250812000002_rls_policies.sql`
5. Run it

---

## Phase 7: Make It Production Ready (Optional - 2 hours)

### 1. Add Error Monitoring
```bash
# Sign up for Sentry (free tier)
pnpm add @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 2. Add Analytics
```bash
# Sign up for Posthog (free tier)
pnpm add posthog-js
```

### 3. Set Up Custom Domain
1. Buy domain (e.g., studysharper.com)
2. In Vercel: Settings → Domains → Add Domain
3. Follow DNS configuration instructions

### 4. Optimize Performance
```bash
# Run performance audit
pnpm build
pnpm start
# Open Chrome DevTools → Lighthouse → Run audit
```

### 5. Add User Feedback
Create feedback form in dashboard:
```typescript
// apps/web/components/feedback/feedback-form.tsx
export function FeedbackForm() {
  // Simple form that saves to Supabase 'feedback' table
}
```

---

## 🎉 Launch Checklist

Before giving to students:

### Must Have:
- [x] Supabase deployed and migrations run
- [x] Authentication working (email or Google)
- [x] At least one AI provider configured
- [x] File upload processing PDFs
- [x] Basic flashcard review working
- [x] Study timer functional

### Nice to Have:
- [ ] Custom domain
- [ ] Error monitoring
- [ ] Analytics
- [ ] Mobile responsive testing
- [ ] Feedback system
- [ ] Terms of Service / Privacy Policy

---

## 📱 Quick Mobile PWA Setup (15 minutes)

Add to `apps/web/public/manifest.json`:
```json
{
  "name": "StudySharper",
  "short_name": "StudySharper",
  "description": "AI-Powered Study Assistant",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#6366f1",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Add to `apps/web/app/layout.tsx` in the `<head>`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="apple-mobile-web-app-capable" content="yes" />
```

---

## 💰 Cost Breakdown for 100 Students

### Monthly Costs:
- **Supabase**: Free (up to 500MB database, 2GB storage)
- **Vercel**: Free (100GB bandwidth)
- **AI (OpenRouter)**: ~$20-50 (depends on usage)
- **Domain**: ~$1/month ($12/year)

**Total: ~$25-55/month for 100 active students**

---

## 🚨 Emergency Contacts

If something breaks:

1. **Supabase Issues**: support@supabase.io or Discord
2. **Vercel Issues**: Check status.vercel.com
3. **AI Provider Issues**: Check OpenRouter/OpenAI status pages
4. **Google OAuth**: console.cloud.google.com → check quotas

---

## ✅ You're Ready!

After completing Phases 1-5, you'll have:
- A working study app
- AI-powered Q&A on PDFs
- Spaced repetition flashcards
- Study timer with Pomodoro technique
- Basic analytics and progress tracking

Students can start using it immediately for:
- Uploading course materials
- Creating flashcards
- Reviewing with spaced repetition
- Tracking study sessions
- Getting AI help with content

**Estimated Total Setup Time: 4-6 hours**
**Ongoing Time: ~1 hour/week for maintenance**

Good luck! 🎓