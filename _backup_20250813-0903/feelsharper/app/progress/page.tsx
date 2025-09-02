import { Metadata } from 'next';
import ProgressTracker from '@/components/progress/ProgressTracker';

export const metadata: Metadata = {
  title: 'Progress Tracker | Feel Sharper',
  description: 'Track your fitness progress and see your improvements over time',
};

export default function ProgressPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Your Progress
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Track your improvements and celebrate your wins
          </p>
        </div>
        
        <ProgressTracker />
      </div>
    </div>
  );
}