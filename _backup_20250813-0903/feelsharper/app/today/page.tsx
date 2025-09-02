import type { Metadata } from 'next';
import { Apple, Dumbbell, Activity, TrendingUp } from 'lucide-react';
import { quickActions } from '@/lib/navigation/routes';
import SimpleHeader from '@/components/navigation/SimpleHeader';

export const metadata: Metadata = {
  title: 'Today | Feel Sharper',
  description: 'Your fitness hub - log food, workouts, and weight with fast actions.',
};

export default function TodayPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <SimpleHeader />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Today</h1>
          <p className="text-text-secondary text-lg">{today}</p>
        </div>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <a
                  key={index}
                  href={action.href}
                  className={`group relative ${action.color} rounded-xl p-8 text-center hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-focus`}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="p-4 bg-white/20 rounded-xl group-hover:bg-white/30 transition-colors">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-white">
                      {action.label}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* Today's Summary */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">Today's Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Food Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Apple className="w-6 h-6 text-success" />
                <h3 className="text-lg font-semibold">Food</h3>
              </div>
              <div className="space-y-2 text-text-secondary">
                <p>No meals logged yet</p>
                <a href="/food/add" className="text-navy hover:underline text-sm">
                  Log your first meal →
                </a>
              </div>
            </div>

            {/* Workout Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Dumbbell className="w-6 h-6 text-navy" />
                <h3 className="text-lg font-semibold">Workout</h3>
              </div>
              <div className="space-y-2 text-text-secondary">
                <p>No workout logged yet</p>
                <a href="/workouts/add" className="text-navy hover:underline text-sm">
                  Log your workout →
                </a>
              </div>
            </div>

            {/* Weight Card */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-6 h-6 text-info" />
                <h3 className="text-lg font-semibold">Weight</h3>
              </div>
              <div className="space-y-2 text-text-secondary">
                <p>No weight logged yet</p>
                <a href="/weight/add" className="text-navy hover:underline text-sm">
                  Add your weight →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-text-primary">Recent Activity</h2>
          <div className="bg-surface-2 border-2 border-dashed border-border rounded-xl p-12 text-center">
            <TrendingUp className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-secondary mb-2">
              Start tracking to see your progress
            </h3>
            <p className="text-text-muted mb-6">
              Once you log food, workouts, or weight, your recent activity will appear here.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href="/food/add"
                className="inline-flex items-center px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
              >
                <Apple className="w-4 h-4 mr-2" />
                Log Food
              </a>
              <a
                href="/workouts/add"
                className="inline-flex items-center px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy-600 transition-colors"
              >
                <Dumbbell className="w-4 h-4 mr-2" />
                Log Workout
              </a>
              <a
                href="/weight/add"
                className="inline-flex items-center px-4 py-2 bg-info text-white rounded-lg hover:bg-info/90 transition-colors"
              >
                <Activity className="w-4 h-4 mr-2" />
                Add Weight
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}