import Link from 'next/link'
import SimpleHeader from '@/components/navigation/SimpleHeader'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">About Feel Sharper</h1>
        
        <div className="space-y-6 text-text-secondary">
          <p className="text-lg">
            Feel Sharper is a free fitness tracking app designed to make logging your nutrition, workouts, and body weight simple and effective.
          </p>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Our Mission</h2>
            <p>
              To provide a completely free, ad-free fitness tracking experience that helps you achieve your health and fitness goals without complexity or cost.
            </p>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Key Features</h2>
            <ul className="space-y-2">
              <li>• Fast food logging with USDA verified database</li>
              <li>• Workout tracking with AI-powered parsing</li>
              <li>• Weight tracking with progress graphs</li>
              <li>• Clean, dark-first interface</li>
              <li>• Multi-tenant safe with Row-Level Security</li>
            </ul>
          </div>
          
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Why Free?</h2>
            <p>
              We believe everyone should have access to quality fitness tracking tools. No subscriptions, no ads, no premium tiers - just fitness tracking that works.
            </p>
          </div>
          
          <div className="flex gap-4 mt-8">
            <Link 
              href="/sign-up" 
              className="inline-flex items-center justify-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors"
            >
              Get Started
            </Link>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-3 bg-surface border border-border text-text-primary rounded-xl hover:bg-surface-2 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}