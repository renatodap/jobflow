import { Metadata } from 'next';
import FitnessHero from '@/components/home/FitnessHero';
import SimpleHeader from '@/components/navigation/SimpleHeader';

export const metadata: Metadata = {
  title: 'Feel Sharper | Free Fitness Tracker',
  description: 'Track food, workouts, and weight with clean graphs. Completely free, no ads, no subscriptions.',
};

export default async function HomePage() {
  return (
    <main className="min-h-screen bg-bg">
      <SimpleHeader />
      {/* Hero Section */}
      <FitnessHero />
      

      {/* CTA Section */}
      <section className="py-20 px-4 bg-navy">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Start Tracking
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/sign-up" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-navy bg-white rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              Sign Up Free
            </a>
            <a 
              href="/today" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              View Demo
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}