import type { Metadata } from 'next';
import { Dumbbell, Plus, Calendar, TrendingUp, Clock, Trophy, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Workouts | Feel Sharper',
  description: 'Track your workouts with fast logging and progress insights.',
};

export default function WorkoutsPage() {
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Workouts</h1>
            <p className="text-text-secondary text-lg">{today}</p>
          </div>
          <a
            href="/workouts/add"
            className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <Plus className="w-5 h-5 mr-2" />
            Log Workout
          </a>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">This Week</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">Total Volume</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">Duration</div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-2xl font-bold text-text-primary">0</div>
            <div className="text-sm text-text-secondary">PRs</div>
          </div>
        </div>

        {/* Today's Workout */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Today's Workout</h2>
          <div className="bg-surface border border-border rounded-xl p-6">
            <div className="py-12 text-center">
              <Dumbbell className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-text-secondary mb-2">
                No workout logged yet
              </h3>
              <p className="text-text-muted mb-6">
                Start tracking your workout or paste from your notes app
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="/workouts/add"
                  className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Manual Entry
                </a>
                <a
                  href="/workouts/add?mode=ai"
                  className="inline-flex items-center px-6 py-3 bg-surface-2 border border-border text-text-primary rounded-xl hover:bg-surface-3 transition-colors"
                >
                  <Dumbbell className="w-5 h-5 mr-2" />
                  AI Parser
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Workouts */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recent Workouts</h2>
            <button className="text-navy hover:underline">
              View all
            </button>
          </div>
          
          <div className="bg-surface-2 border-2 border-dashed border-border rounded-xl p-12 text-center">
            <Calendar className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-text-secondary mb-2">
              Start logging workouts
            </h3>
            <p className="text-text-muted mb-6">
              Your recent workouts will appear here once you start tracking
            </p>
            <a
              href="/workouts/add"
              className="inline-flex items-center px-6 py-3 bg-navy text-white rounded-xl hover:bg-navy-600 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log First Workout
            </a>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Workout Programs */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Target className="w-6 h-6 text-navy" />
                  <h3 className="text-lg font-semibold">Programs</h3>
                </div>
                <a
                  href="/workouts/programs"
                  className="text-navy hover:underline text-sm"
                >
                  Browse all
                </a>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">Structured workout plans</p>
                  <p className="text-text-muted text-sm mt-1">
                    Follow proven programs to reach your goals
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Records */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-semibold">Records</h3>
                </div>
                <a
                  href="/workouts/records"
                  className="text-navy hover:underline text-sm"
                >
                  View all
                </a>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">Track your best lifts</p>
                  <p className="text-text-muted text-sm mt-1">
                    Monitor progress and celebrate PRs
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-success" />
                  <h3 className="text-lg font-semibold">Dashboard</h3>
                </div>
                <a
                  href="/workouts/dashboard"
                  className="text-navy hover:underline text-sm"
                >
                  Open
                </a>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">Current program progress</p>
                  <p className="text-text-muted text-sm mt-1">
                    See today's workout and track progress
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-surface border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-text-secondary" />
                  <h3 className="text-lg font-semibold">Recent</h3>
                </div>
                <a
                  href="/workouts/history"
                  className="text-navy hover:underline text-sm"
                >
                  View history
                </a>
              </div>
              <div className="space-y-3">
                <div className="py-8 text-center">
                  <p className="text-text-secondary">Recent workouts</p>
                  <p className="text-text-muted text-sm mt-1">
                    Review past sessions and patterns
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}