import type { Metadata } from 'next';
import AICoach from '@/components/coach/AICoach';

export const metadata: Metadata = {
  title: 'AI Coach — Feel Sharper',
  description: 'Your personalized fitness and wellness AI assistant',
};

export default function CoachPage() {
  return <AICoach />;
}
