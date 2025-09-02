import { Metadata } from 'next';
import LandingPage from '@/components/home/LandingPage';

export const metadata: Metadata = {
  title: 'FeelSharper | AI-Powered Fitness Tracker',
  description: 'Track workouts with natural language. AI coaching, progress analytics, and nutrition tracking. Start your 7-day free trial.',
  keywords: 'fitness tracker, workout log, AI coaching, nutrition tracking, gym tracker, progress analytics',
  openGraph: {
    title: 'FeelSharper - Track Smarter, Train Harder',
    description: 'The only fitness tracker that understands natural language. Just type your workout like you would text a friend.',
    images: ['/og-image.png'],
  },
};

export default async function HomePage() {
  return <LandingPage />;
}