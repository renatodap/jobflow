import type { Metadata } from 'next'
import Link from 'next/link'
import SimpleHeader from '@/components/navigation/SimpleHeader'

export const metadata: Metadata = {
  title: 'Blog | Feel Sharper',
  description: 'Fitness and health articles for Feel Sharper users.',
}

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-text-secondary mb-8">
            Coming soon - fitness and health articles for Feel Sharper users.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
