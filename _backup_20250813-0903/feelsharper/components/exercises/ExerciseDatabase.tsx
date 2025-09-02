"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Search,
  Filter,
  Plus,
  Dumbbell,
  Heart,
  Target,
  Clock,
  TrendingUp,
  Star,
  BookOpen,
  Play,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Exercise {
  id: string;
  name: string;
  category: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  instructions: string[];
  tips: string[];
  variations: string[];
  common_mistakes: string[];
  is_favorite?: boolean;
  personal_records?: {
    max_weight?: number;
    max_reps?: number;
    best_volume?: number;
    last_performed?: string;
  };
}

interface ExerciseStats {
  total_sessions: number;
  total_volume: number;
  max_weight: number;
  avg_rpe: number;
  progression_trend: 'up' | 'down' | 'stable';
  last_performed: string;
}

const CATEGORIES = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
  'Full Body'
];

const EQUIPMENT = [
  'Bodyweight',
  'Barbell',
  'Dumbbell',
  'Kettlebell',
  'Cable',
  'Machine',
  'Resistance Band',
  'Other'
];

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  intermediate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

// Sample exercise data - in production this would come from your database
const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    category: 'Chest',
    muscle_groups: ['Chest', 'Shoulders', 'Triceps'],
    equipment: ['Barbell', 'Bench'],
    difficulty: 'intermediate',
    description: 'A compound exercise that primarily targets the chest muscles while also working the shoulders and triceps.',
    instructions: [
      'Lie flat on the bench with your feet firmly planted on the ground',
      'Grip the barbell with hands slightly wider than shoulder-width apart',
      'Lower the bar to your chest with control',
      'Press the bar back up to the starting position',
      'Keep your core tight throughout the movement'
    ],
    tips: [
      'Keep your shoulder blades retracted',
      'Maintain a slight arch in your lower back',
      'Control the descent - don\'t bounce the bar off your chest',
      'Focus on squeezing your chest muscles at the top'
    ],
    variations: [
      'Incline Barbell Bench Press',
      'Decline Barbell Bench Press',
      'Close-Grip Bench Press',
      'Pause Bench Press'
    ],
    common_mistakes: [
      'Bouncing the bar off the chest',
      'Flaring elbows too wide',
      'Lifting feet off the ground',
      'Not maintaining proper arch'
    ]
  },
  {
    id: '2',
    name: 'Deadlift',
    category: 'Back',
    muscle_groups: ['Back', 'Glutes', 'Hamstrings', 'Core'],
    equipment: ['Barbell'],
    difficulty: 'advanced',
    description: 'The king of compound exercises, working nearly every muscle in your body with emphasis on the posterior chain.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot',
      'Bend at hips and knees to grip the bar',
      'Keep your chest up and back straight',
      'Drive through your heels to lift the bar',
      'Stand tall with shoulders back at the top'
    ],
    tips: [
      'Keep the bar close to your body throughout',
      'Engage your lats to keep the bar path straight',
      'Don\'t hyperextend at the top',
      'Control the descent'
    ],
    variations: [
      'Sumo Deadlift',
      'Romanian Deadlift',
      'Trap Bar Deadlift',
      'Deficit Deadlift'
    ],
    common_mistakes: [
      'Rounding the back',
      'Bar drifting away from body',
      'Not engaging the lats',
      'Hyperextending at the top'
    ]
  },
  {
    id: '3',
    name: 'Push-ups',
    category: 'Chest',
    muscle_groups: ['Chest', 'Shoulders', 'Triceps', 'Core'],
    equipment: ['Bodyweight'],
    difficulty: 'beginner',
    description: 'A fundamental bodyweight exercise that builds upper body and core strength.',
    instructions: [
      'Start in a plank position with hands under shoulders',
      'Lower your body until chest nearly touches the ground',
      'Push back up to starting position',
      'Keep your body in a straight line throughout'
    ],
    tips: [
      'Engage your core to maintain straight body line',
      'Don\'t let your hips sag or pike up',
      'Control both the descent and ascent',
      'Breathe out as you push up'
    ],
    variations: [
      'Incline Push-ups',
      'Decline Push-ups',
      'Diamond Push-ups',
      'Wide-Grip Push-ups'
    ],
    common_mistakes: [
      'Sagging hips',
      'Not going through full range of motion',
      'Flaring elbows too wide',
      'Rushing through the movement'
    ]
  }
];

export default function ExerciseDatabase() {
  const [exercises, setExercises] = useState<Exercise[]>(SAMPLE_EXERCISES);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>(SAMPLE_EXERCISES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exerciseStats, setExerciseStats] = useState<Record<string, ExerciseStats>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    filterExercises();
  }, [searchTerm, selectedCategory, selectedEquipment, selectedDifficulty, exercises]);

  useEffect(() => {
    loadExerciseStats();
  }, []);

  const loadExerciseStats = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Load exercise statistics from workout history
      const { data: workouts } = await supabase
        .from('workouts')
        .select(`
          *,
          workout_sets (
            exercise_name,
            weight_kg,
            reps,
            rpe
          )
        `)
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (workouts) {
        const stats: Record<string, ExerciseStats> = {};
        
        workouts.forEach(workout => {
          workout.workout_sets?.forEach((set: any) => {
            const exerciseName = set.exercise_name;
            if (!stats[exerciseName]) {
              stats[exerciseName] = {
                total_sessions: 0,
                total_volume: 0,
                max_weight: 0,
                avg_rpe: 0,
                progression_trend: 'stable',
                last_performed: workout.started_at
              };
            }
            
            stats[exerciseName].total_sessions++;
            stats[exerciseName].total_volume += (set.weight_kg || 0) * (set.reps || 0);
            stats[exerciseName].max_weight = Math.max(stats[exerciseName].max_weight, set.weight_kg || 0);
            
            if (new Date(workout.started_at) > new Date(stats[exerciseName].last_performed)) {
              stats[exerciseName].last_performed = workout.started_at;
            }
          });
        });

        setExerciseStats(stats);
      }
    } catch (error) {
      console.error('Error loading exercise stats:', error);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exercise.muscle_groups.some(muscle => 
          muscle.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        exercise.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }

    // Equipment filter
    if (selectedEquipment) {
      filtered = filtered.filter(exercise => 
        exercise.equipment.includes(selectedEquipment)
      );
    }

    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(exercise => exercise.difficulty === selectedDifficulty);
    }

    setFilteredExercises(filtered);
  };

  const toggleFavorite = async (exerciseId: string) => {
    // In a real app, this would update the database
    setExercises(prev => prev.map(exercise => 
      exercise.id === exerciseId 
        ? { ...exercise, is_favorite: !exercise.is_favorite }
        : exercise
    ));
  };

  const addToWorkout = (exercise: Exercise) => {
    // This would integrate with the workout logger
    console.log('Adding to workout:', exercise.name);
    alert(`${exercise.name} added to current workout!`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedEquipment('');
    setSelectedDifficulty('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Exercise Database
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Discover exercises, track progress, and build better workouts
              </p>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={cn(
            "lg:col-span-1 space-y-4",
            !showFilters && "hidden lg:block"
          )}>
            <Card className="p-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Search & Filters
              </h3>
              
              {/* Search */}
              <div className="mb-4">
                <Label htmlFor="search">Search Exercises</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Exercise name, muscle group..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Equipment Filter */}
              <div className="mb-4">
                <Label htmlFor="equipment">Equipment</Label>
                <select
                  id="equipment"
                  value={selectedEquipment}
                  onChange={(e) => setSelectedEquipment(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Any Equipment</option>
                  {EQUIPMENT.map(equipment => (
                    <option key={equipment} value={equipment}>{equipment}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="mb-4">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                >
                  <option value="">Any Difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <Button
                variant="ghost"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </Card>
          </div>

          {/* Exercise List */}
          <div className="lg:col-span-3">
            {selectedExercise ? (
              /* Exercise Detail View */
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedExercise(null)}
                      className="mb-4 p-0 h-auto font-normal text-slate-600 hover:text-slate-900"
                    >
                      ← Back to exercises
                    </Button>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                      {selectedExercise.name}
                    </h2>
                    <div className="flex items-center space-x-4 mb-4">
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-medium",
                        DIFFICULTY_COLORS[selectedExercise.difficulty]
                      )}>
                        {selectedExercise.difficulty}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {selectedExercise.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        {selectedExercise.muscle_groups.map(muscle => (
                          <span key={muscle} className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                            {muscle}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => toggleFavorite(selectedExercise.id)}
                    >
                      <Star className={cn(
                        "w-4 h-4",
                        selectedExercise.is_favorite ? "fill-amber-400 text-amber-400" : "text-slate-400"
                      )} />
                    </Button>
                    <Button onClick={() => addToWorkout(selectedExercise)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Workout
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Description
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        {selectedExercise.description}
                      </p>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Instructions
                      </h3>
                      <ol className="space-y-2">
                        {selectedExercise.instructions.map((instruction, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Tips */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Tips for Success
                      </h3>
                      <ul className="space-y-2">
                        {selectedExercise.tips.map((tip, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <Target className="flex-shrink-0 w-4 h-4 text-green-600 mt-0.5" />
                            <span className="text-slate-600 dark:text-slate-400">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Common Mistakes */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Common Mistakes
                      </h3>
                      <ul className="space-y-2">
                        {selectedExercise.common_mistakes.map((mistake, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-4 h-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mt-0.5">
                              <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            </div>
                            <span className="text-slate-600 dark:text-slate-400">{mistake}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Variations */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                        Variations
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedExercise.variations.map((variation, index) => (
                          <div key={index} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-slate-700 dark:text-slate-300">{variation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Stats Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-6 space-y-4">
                      {/* Equipment */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                          Equipment Needed
                        </h4>
                        <div className="space-y-1">
                          {selectedExercise.equipment.map(item => (
                            <span key={item} className="block text-sm text-slate-600 dark:text-slate-400">
                              • {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Personal Stats */}
                      {exerciseStats[selectedExercise.name] && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                            Your Progress
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">Total Sessions</span>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {exerciseStats[selectedExercise.name].total_sessions}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">Max Weight</span>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {exerciseStats[selectedExercise.name].max_weight} kg
                              </p>
                            </div>
                            <div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">Last Performed</span>
                              <p className="font-semibold text-slate-900 dark:text-slate-100">
                                {new Date(exerciseStats[selectedExercise.name].last_performed).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              /* Exercise Grid */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-600 dark:text-slate-400">
                    {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExercises.map(exercise => (
                    <Card key={exercise.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                            {exercise.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                            {exercise.category} • {exercise.muscle_groups.join(', ')}
                          </p>
                          <span className={cn(
                            "inline-block px-2 py-1 rounded-full text-xs font-medium",
                            DIFFICULTY_COLORS[exercise.difficulty]
                          )}>
                            {exercise.difficulty}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(exercise.id);
                          }}
                        >
                          <Star className={cn(
                            "w-4 h-4",
                            exercise.is_favorite ? "fill-amber-400 text-amber-400" : "text-slate-400"
                          )} />
                        </Button>
                      </div>

                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                        {exercise.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          {exercise.equipment.slice(0, 2).map(item => (
                            <span key={item} className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                              {item}
                            </span>
                          ))}
                          {exercise.equipment.length > 2 && (
                            <span className="text-slate-400">+{exercise.equipment.length - 2}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToWorkout(exercise);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setSelectedExercise(exercise)}
                          >
                            View
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {filteredExercises.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                      No exercises found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      Try adjusting your search or filters
                    </p>
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
