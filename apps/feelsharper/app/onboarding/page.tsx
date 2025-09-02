import type { Metadata } from 'next';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

export const metadata: Metadata = {
  title: 'Get Started — Feel Sharper',
  description: 'Set your goals and customize your experience',
};

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
