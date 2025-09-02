import type { Metadata } from 'next';
import NutritionTrackerV2 from '@/components/nutrition/NutritionTrackerV2';

export const metadata: Metadata = {
  title: 'Log Meal — Feel Sharper',
  description: 'Track your nutrition and hit your macro targets',
};

export default function LogMealPage() {
  return <NutritionTrackerV2 />;
}
