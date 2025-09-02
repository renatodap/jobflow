'use client';

import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Search, Filter, Clock, Users, Target, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { WorkoutProgramWithTemplates } from '@/lib/types/database';

const GOAL_TYPES = [
  { value: 'strength', label: 'Strength', icon: Dumbbell, color: 'text-navy' },
  { value: 'muscle_gain', label: 'Muscle Gain', icon: Zap, color: 'text-success' },
  { value: 'endurance', label: 'Endurance', icon: Target, color: 'text-blue-400' },
  { value: 'fat_loss', label: 'Fat Loss', icon: Target, color: 'text-red-400' },
  { value: 'general_fitness', label: 'General Fitness', icon: Users, color: 'text-text-secondary' },
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-500/20 text-green-400' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-500/20 text-red-400' },
];

export default function WorkoutProgramsPage() {
  const [programs, setPrograms] = useState<WorkoutProgramWithTemplates[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoalType, setSelectedGoalType] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [filteredPrograms, setFilteredPrograms] = useState<WorkoutProgramWithTemplates[]>([]);

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    let filtered = programs;

    // Filter by goal type
    if (selectedGoalType !== 'all') {
      filtered = filtered.filter(program => program.goal_type === selectedGoalType);
    }

    // Filter by experience level
    if (selectedExperience !== 'all') {
      filtered = filtered.filter(program => program.experience_level === selectedExperience);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(program =>
        program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPrograms(filtered);
  }, [searchTerm, selectedGoalType, selectedExperience, programs]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/workout-programs?public_only=true');
      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignProgram = async (programId: string, programName: string) => {
    try {
      const response = await fetch(`/api/workout-programs/${programId}/assign`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Successfully assigned "${programName}" program!`);
        // Redirect to user programs or dashboard
        window.location.href = '/workouts/dashboard';
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign program');
      }
    } catch (error) {
      console.error('Error assigning program:', error);
      alert('Failed to assign program');
    }
  };

  const getGoalTypeInfo = (goalType: string | null) => {
    const info = GOAL_TYPES.find(g => g.value === goalType);
    return info || { label: 'General', icon: Users, color: 'text-text-secondary' };
  };

  const getExperienceInfo = (level: string | null) => {
    const info = EXPERIENCE_LEVELS.find(e => e.value === level);
    return info || { label: 'All Levels', color: 'bg-text-muted/20 text-text-muted' };
  };

  const getProgramStats = (program: WorkoutProgramWithTemplates) => {
    const templates = program.workout_templates || [];
    const totalWorkouts = templates.length;
    const avgDuration = templates.reduce((sum, t) => sum + (t.estimated_duration_minutes || 0), 0) / totalWorkouts || 0;
    
    return {
      totalWorkouts,
      avgDuration: Math.round(avgDuration),
      weeksRange: program.duration_weeks || 'Ongoing',
      sessionsPerWeek: program.sessions_per_week || 'Flexible'
    };
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Dumbbell className="w-10 h-10 text-navy" />
              Workout Programs
            </h1>
            <p className="text-text-secondary text-lg">
              Structured programs to reach your fitness goals
            </p>
          </div>
          <Button 
            onClick={() => window.location.href = '/workouts/dashboard'}
            variant="outline"
          >
            My Programs
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-surface border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search programs..."
                className="w-full pl-12 pr-4 py-3 bg-bg border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>

            {/* Goal Type Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Goal Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGoalType('all')}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    selectedGoalType === 'all'
                      ? 'bg-navy/20 border-navy text-navy'
                      : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All Goals
                </button>
                {GOAL_TYPES.map((goal) => {
                  const Icon = goal.icon;
                  return (
                    <button
                      key={goal.value}
                      onClick={() => setSelectedGoalType(goal.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        selectedGoalType === goal.value
                          ? 'bg-navy/20 border-navy text-navy'
                          : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{goal.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Level Filter */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Experience Level</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedExperience('all')}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    selectedExperience === 'all'
                      ? 'bg-navy/20 border-navy text-navy'
                      : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  All Levels
                </button>
                {EXPERIENCE_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setSelectedExperience(level.value)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      selectedExperience === level.value
                        ? 'bg-navy/20 border-navy text-navy'
                        : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span className="text-sm">{level.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-border rounded mb-3"></div>
                <div className="h-4 bg-border rounded mb-2"></div>
                <div className="h-4 bg-border rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-border rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPrograms.length === 0 && !searchTerm && selectedGoalType === 'all' && selectedExperience === 'all' && (
          <div className="text-center py-16">
            <Dumbbell className="w-24 h-24 text-text-muted mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">No programs available</h3>
            <p className="text-text-secondary">
              Check back later for new workout programs
            </p>
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && filteredPrograms.length === 0 && (searchTerm || selectedGoalType !== 'all' || selectedExperience !== 'all') && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No programs found</h3>
            <p className="text-text-secondary">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Programs Grid */}
        {!isLoading && filteredPrograms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrograms.map((program) => {
              const goalInfo = getGoalTypeInfo(program.goal_type);
              const experienceInfo = getExperienceInfo(program.experience_level);
              const stats = getProgramStats(program);
              const GoalIcon = goalInfo.icon;

              return (
                <div key={program.id} className="bg-surface border border-border rounded-xl p-6 hover:border-navy/50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-navy/20">
                        <GoalIcon className={`w-6 h-6 ${goalInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg line-clamp-1">{program.name}</h3>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${experienceInfo.color}`}>
                          {experienceInfo.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {program.description && (
                    <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                      {program.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span className="text-text-secondary">
                        {stats.avgDuration > 0 ? `${stats.avgDuration} min` : 'Flexible'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-text-muted" />
                      <span className="text-text-secondary">
                        {stats.weeksRange} weeks
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-text-muted" />
                      <span className="text-text-secondary">
                        {stats.totalWorkouts} workouts
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-text-muted" />
                      <span className="text-text-secondary">
                        {stats.sessionsPerWeek}/week
                      </span>
                    </div>
                  </div>

                  {/* Equipment */}
                  {program.equipment_required && program.equipment_required.length > 0 && (
                    <div className="mb-4">
                      <p className="text-text-muted text-xs mb-2">Equipment needed:</p>
                      <div className="flex flex-wrap gap-1">
                        {program.equipment_required.slice(0, 3).map((equipment, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-bg border border-border rounded text-xs text-text-secondary"
                          >
                            {equipment.replace('_', ' ')}
                          </span>
                        ))}
                        {program.equipment_required.length > 3 && (
                          <span className="px-2 py-1 bg-bg border border-border rounded text-xs text-text-muted">
                            +{program.equipment_required.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        window.location.href = `/workouts/programs/${program.id}`;
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-navy hover:bg-navy/80"
                      onClick={() => handleAssignProgram(program.id, program.name)}
                    >
                      Start Program
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && programs.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="text-center text-text-muted">
              <p>
                {programs.length} program{programs.length !== 1 ? 's' : ''} available
                {searchTerm && ` • ${filteredPrograms.length} shown`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}