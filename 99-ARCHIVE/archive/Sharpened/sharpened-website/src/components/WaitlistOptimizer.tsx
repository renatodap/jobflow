'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle, Star, Users, Zap } from 'lucide-react'

interface WaitlistVariant {
  id: string
  headline: string
  subtext: string
  cta: string
  socialProof: string
  urgency?: string
}

const VARIANTS: WaitlistVariant[] = [
  {
    id: 'control',
    headline: 'Join the Waitlist',
    subtext: 'Be the first to experience AI coaching that actually works.',
    cta: 'Get Early Access',
    socialProof: '500+ athletes and students already joined'
  },
  {
    id: 'urgency',
    headline: 'Limited Beta Access',
    subtext: 'Only 100 spots available for our private beta launch.',
    cta: 'Secure Your Spot',
    socialProof: '73 spots remaining',
    urgency: 'Beta closes January 31st'
  },
  {
    id: 'social_proof',
    headline: 'Join 500+ High Performers',
    subtext: 'NCAA athletes, engineers, and founders using Sharpened to track real progress.',
    cta: 'Join the Community',
    socialProof: 'Featured by startup communities'
  },
  {
    id: 'problem_focused',
    headline: 'Stop Tracking Activity. Start Tracking Progress.',
    subtext: 'Your fitness app shows you burned calories. Sharpened shows you getting stronger.',
    cta: 'Track Real Progress',
    socialProof: 'Built by an NCAA athlete who codes'
  }
]

export default function WaitlistOptimizer() {
  const [variant, setVariant] = useState<WaitlistVariant>(VARIANTS[0])
  const [email, setEmail] = useState('')
  const [source, setSource] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userSegment, setUserSegment] = useState('')

  useEffect(() => {
    // A/B Test Assignment
    const assignedVariant = Math.floor(Math.random() * VARIANTS.length)
    setVariant(VARIANTS[assignedVariant])

    // Traffic Source Detection
    const params = new URLSearchParams(window.location.search)
    const utmSource = params.get('utm_source') || 'direct'
    setSource(utmSource)

    // User Segment Detection (simple heuristics)
    const userAgent = navigator.userAgent
    const timeOfDay = new Date().getHours()
    const isWeekend = [0, 6].includes(new Date().getDay())
    
    let segment = 'general'
    if (utmSource.includes('twitter')) segment = 'tech_twitter'
    if (utmSource.includes('linkedin')) segment = 'professional'
    if (utmSource.includes('hackernews')) segment = 'hacker_news'
    if (utmSource.includes('reddit')) segment = 'reddit'
    
    setUserSegment(segment)

    // Analytics Event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'waitlist_view', {
        variant_id: variant.id,
        source: utmSource,
        segment: segment,
        time_of_day: timeOfDay,
        is_weekend: isWeekend
      })
    }
  }, [variant.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Submit to multiple services for redundancy
      await Promise.all([
        // Supabase
        fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            variant_id: variant.id,
            source,
            user_segment: userSegment,
            timestamp: new Date().toISOString()
          })
        }),
        
        // Backup: Airtable
        fetch('https://api.airtable.com/v0/YOUR_BASE_ID/Waitlist', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              Email: email,
              Variant: variant.id,
              Source: source,
              Segment: userSegment,
              Timestamp: new Date().toISOString()
            }
          })
        })
      ])

      // Analytics Events
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'waitlist_signup', {
          variant_id: variant.id,
          source,
          segment: userSegment
        })
      }

      // Trigger welcome email sequence
      await fetch('/api/welcome-sequence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, variant_id: variant.id })
      })

      setIsSubmitted(true)
    } catch (error) {
      console.error('Waitlist signup error:', error)
      // Fallback: mailto
      window.location.href = `mailto:waitlist@sharpened.ai?subject=Waitlist Signup&body=Email: ${email}%0AVariant: ${variant.id}%0ASource: ${source}`
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPersonalizedMessage = () => {
    switch (userSegment) {
      case 'tech_twitter':
        return 'Join fellow engineers building better habits with data'
      case 'professional':
        return 'Professional athletes and executives already use Sharpened'
      case 'hacker_news':
        return 'Open source components coming soon for the community'
      default:
        return variant.subtext
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        className="max-w-md mx-auto text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h3 className="text-2xl font-bold mb-4">You&apos;re In! 🎉</h3>
        <p className="text-zinc-400 mb-6">
          Welcome to the Sharpened community. You&apos;ll get early access when we launch.
        </p>
        <div className="bg-deep-gray/50 p-4 rounded-lg border border-zinc-800">
          <h4 className="font-semibold mb-2">What&apos;s Next?</h4>
          <ul className="text-sm text-zinc-400 space-y-1 text-left">
            <li>• Beta access (2-3 weeks)</li>
            <li>• Weekly development updates</li>
            <li>• Direct feedback channel</li>
            <li>• Lifetime discount when we launch</li>
          </ul>
        </div>
        
        {/* Social Share CTA */}
        <div className="mt-6 p-4 bg-electric-blue/10 rounded-lg border border-electric-blue/20">
          <p className="text-sm mb-3">Know other athletes or builders who&apos;d love this?</p>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=Just joined the waitlist for @Sharpened - AI coaching that actually tracks progress, not just activity. Built by an NCAA athlete who codes 🚀&url=https://sharpened.ai?utm_source=twitter_share`)}
              className="flex-1 bg-electric-blue hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
            >
              Share on Twitter
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(`https://sharpened.ai?utm_source=referral_${email.split('@')[0]}`)}
              className="flex-1 border border-zinc-700 hover:border-zinc-600 px-4 py-2 rounded text-sm transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Variant-Specific Content */}
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          {variant.headline}
        </h2>
        <p className="text-zinc-400 text-lg mb-4">
          {getPersonalizedMessage()}
        </p>
        
        {/* Social Proof */}
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          {variant.id === 'urgency' && <Zap className="w-4 h-4 text-orange-500" />}
          {variant.id === 'social_proof' && <Star className="w-4 h-4 text-yellow-500" />}
          {variant.id !== 'urgency' && variant.id !== 'social_proof' && <Users className="w-4 h-4" />}
          <span>{variant.socialProof}</span>
        </div>
        
        {/* Urgency (if applicable) */}
        {variant.urgency && (
          <div className="mt-2 text-sm text-orange-400 font-medium">
            {variant.urgency}
          </div>
        )}
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full bg-deep-gray/50 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all"
          />
        </div>
        
        <motion.button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-electric-blue hover:bg-blue-600 disabled:bg-zinc-700 text-white px-6 py-3 rounded-lg font-semibold transition-all inline-flex items-center justify-center gap-2 group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {variant.cta}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </motion.button>
      </form>

      {/* Trust Signals */}
      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-500">
          No spam. Unsubscribe anytime. Built with privacy in mind.
        </p>
      </div>

      {/* A/B Test Debug (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-yellow-500/10 rounded text-xs">
          <strong>Debug:</strong> Variant: {variant.id} | Source: {source} | Segment: {userSegment}
        </div>
      )}
    </motion.div>
  )
}