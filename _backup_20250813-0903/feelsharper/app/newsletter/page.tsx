import Link from 'next/link'
import SimpleHeader from '@/components/navigation/SimpleHeader'

export default function NewsletterPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold mb-4">Newsletter</h1>
          <p className="text-text-secondary mb-8">
            Stay updated with fitness tips and new features. Coming soon!
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