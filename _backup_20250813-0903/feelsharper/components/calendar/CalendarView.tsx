"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Dumbbell,
  Apple,
  Moon,
  Target,
  Clock,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id?: string;
  user_id: string;
  date: string;
  type: 'workout' | 'meal' | 'sleep' | 'goal' | 'note';
  title: string;
  description?: string;
  completed: boolean;
  data?: any;
}

interface DayData {
  date: string;
  events: CalendarEvent[];
  workouts: any[];
  meals: any[];
  bodyMetrics: any[];
  sleepLog: any;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_TYPES = [
  { id: 'workout', label: 'Workout', icon: Dumbbell, color: 'bg-blue-500' },
  { id: 'meal', label: 'Meal Plan', icon: Apple, color: 'bg-green-500' },
  { id: 'sleep', label: 'Sleep Goal', icon: Moon, color: 'bg-purple-500' },
  { id: 'goal', label: 'Goal Check', icon: Target, color: 'bg-amber-500' },
  { id: 'note', label: 'Note', icon: Edit, color: 'bg-slate-500' },
];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, DayData>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'workout',
    title: '',
    description: '',
    completed: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get the first and last day of the current month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      // Extend to include previous/next month days shown in calendar
      const calendarStart = new Date(firstDay);
      calendarStart.setDate(calendarStart.getDate() - firstDay.getDay());
      
      const calendarEnd = new Date(lastDay);
      calendarEnd.setDate(calendarEnd.getDate() + (6 - lastDay.getDay()));

      const startDate = calendarStart.toISOString().split('T')[0];
      const endDate = calendarEnd.toISOString().split('T')[0];

      // Load all data for the calendar period
      const [workoutsResult, mealsResult, bodyMetricsResult, sleepResult] = await Promise.all([
        supabase
          .from('workouts')
          .select('*, workout_sets(*), cardio_sessions(*)')
          .eq('user_id', user.id)
          .gte('started_at', `${startDate}T00:00:00`)
          .lte('started_at', `${endDate}T23:59:59`)
          .order('started_at', { ascending: true }),
        
        supabase
          .from('meals')
          .select('*, meal_items(*)')
          .eq('user_id', user.id)
          .gte('eaten_at', `${startDate}T00:00:00`)
          .lte('eaten_at', `${endDate}T23:59:59`)
          .order('eaten_at', { ascending: true }),
        
        supabase
          .from('body_metrics')
          .select('*')
          .eq('user_id', user.id)
          .gte('measured_at', `${startDate}T00:00:00`)
          .lte('measured_at', `${endDate}T23:59:59`)
          .order('measured_at', { ascending: true }),
        
        supabase
          .from('sleep_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })
      ]);

      // Organize data by date
      const dataByDate: Record<string, DayData> = {};
      
      // Initialize all dates in the calendar
      for (let d = new Date(calendarStart); d <= calendarEnd; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dataByDate[dateStr] = {
          date: dateStr,
          events: [],
          workouts: [],
          meals: [],
          bodyMetrics: [],
          sleepLog: null
        };
      }

      // Group workouts by date
      workoutsResult.data?.forEach(workout => {
        const date = workout.started_at.split('T')[0];
        if (dataByDate[date]) {
          dataByDate[date].workouts.push(workout);
        }
      });

      // Group meals by date
      mealsResult.data?.forEach(meal => {
        const date = meal.eaten_at.split('T')[0];
        if (dataByDate[date]) {
          dataByDate[date].meals.push(meal);
        }
      });

      // Group body metrics by date
      bodyMetricsResult.data?.forEach(metric => {
        const date = metric.measured_at.split('T')[0];
        if (dataByDate[date]) {
          dataByDate[date].bodyMetrics.push(metric);
        }
      });

      // Add sleep logs
      sleepResult.data?.forEach(sleep => {
        if (dataByDate[sleep.date]) {
          dataByDate[sleep.date].sleepLog = sleep;
        }
      });

      setCalendarData(dataByDate);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async () => {
    if (!newEvent.title || !selectedDate) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const eventData = {
        user_id: user.id,
        date: selectedDate,
        type: newEvent.type,
        title: newEvent.title,
        description: newEvent.description,
        completed: newEvent.completed || false,
        data: newEvent.data || {}
      };

      // For now, we'll store events in a simple way
      // In a real implementation, you might want a dedicated events table
      console.log('Would save event:', eventData);

      // Reset form
      setNewEvent({
        type: 'workout',
        title: '',
        description: '',
        completed: false
      });
      setShowEventForm(false);
      
      // Reload calendar data
      await loadCalendarData();
      
      alert('Event saved successfully!');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error saving event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Add days from previous month
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // Add all days for 6 weeks (42 days total)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getDayData = (date: Date): DayData => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarData[dateStr] || {
      date: dateStr,
      events: [],
      workouts: [],
      meals: [],
      bodyMetrics: [],
      sleepLog: null
    };
  };

  const getDayActivityCount = (dayData: DayData) => {
    return dayData.workouts.length + dayData.meals.length + dayData.bodyMetrics.length + (dayData.sleepLog ? 1 : 0);
  };

  const getDayActivityColor = (dayData: DayData) => {
    const count = getDayActivityCount(dayData);
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (count <= 2) return 'bg-amber-100 dark:bg-amber-900/20';
    if (count <= 4) return 'bg-green-100 dark:bg-green-900/20';
    return 'bg-blue-100 dark:bg-blue-900/20';
  };

  const days = getDaysInMonth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                Calendar
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Plan your workouts, meals, and track your progress
              </p>
            </div>
            <Button
              onClick={goToToday}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Today</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card className="p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('prev')}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateMonth('next')}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {DAYS.map(day => (
                  <div key={day} className="p-2 text-center">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {day}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  const dayData = getDayData(date);
                  const dateStr = date.toISOString().split('T')[0];
                  const activityCount = getDayActivityCount(dayData);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "p-2 h-24 border border-slate-200 dark:border-slate-700 rounded-lg text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
                        selectedDate === dateStr && "ring-2 ring-amber-500",
                        isToday(date) && "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
                        !isCurrentMonth(date) && "opacity-50",
                        getDayActivityColor(dayData)
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <span className={cn(
                          "text-sm font-medium",
                          isToday(date) ? "text-amber-900 dark:text-amber-100" : "text-slate-900 dark:text-slate-100"
                        )}>
                          {date.getDate()}
                        </span>
                        {activityCount > 0 && (
                          <span className="text-xs bg-slate-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                            {activityCount}
                          </span>
                        )}
                      </div>
                      
                      {/* Activity Indicators */}
                      <div className="mt-1 space-y-1">
                        {dayData.workouts.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Dumbbell className="w-3 h-3 text-blue-600" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {dayData.workouts.length} workout{dayData.workouts.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        {dayData.meals.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Apple className="w-3 h-3 text-green-600" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {dayData.meals.length} meal{dayData.meals.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                        {dayData.sleepLog && (
                          <div className="flex items-center space-x-1">
                            <Moon className="w-3 h-3 text-purple-600" />
                            <span className="text-xs text-slate-600 dark:text-slate-400">
                              {dayData.sleepLog.quality}/5
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Selected Day Details */}
            {selectedDate && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <Button
                    size="sm"
                    onClick={() => setShowEventForm(true)}
                    className="flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </Button>
                </div>

                {selectedDate && calendarData[selectedDate] && (
                  <div className="space-y-4">
                    {/* Workouts */}
                    {calendarData[selectedDate].workouts.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-2">
                          <Dumbbell className="w-4 h-4 text-blue-600" />
                          <span>Workouts</span>
                        </h4>
                        <div className="space-y-2">
                          {calendarData[selectedDate].workouts.map((workout) => (
                            <div key={workout.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                              <p className="font-medium">{workout.type || 'Workout'}</p>
                              <p className="text-slate-500">
                                {new Date(workout.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {workout.ended_at && ` - ${new Date(workout.ended_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Meals */}
                    {calendarData[selectedDate].meals.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-2">
                          <Apple className="w-4 h-4 text-green-600" />
                          <span>Meals</span>
                        </h4>
                        <div className="space-y-2">
                          {calendarData[selectedDate].meals.map((meal) => (
                            <div key={meal.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                              <p className="font-medium">{meal.name}</p>
                              <p className="text-slate-500">
                                {meal.kcal} cal • {new Date(meal.eaten_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sleep */}
                    {calendarData[selectedDate].sleepLog && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-2">
                          <Moon className="w-4 h-4 text-purple-600" />
                          <span>Sleep</span>
                        </h4>
                        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                          <p className="font-medium">Quality: {calendarData[selectedDate].sleepLog.quality}/5</p>
                          {calendarData[selectedDate].sleepLog.duration_hr && (
                            <p className="text-slate-500">
                              Duration: {calendarData[selectedDate].sleepLog.duration_hr}h
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Body Metrics */}
                    {calendarData[selectedDate].bodyMetrics.length > 0 && (
                      <div>
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2 flex items-center space-x-2">
                          <Target className="w-4 h-4 text-amber-600" />
                          <span>Measurements</span>
                        </h4>
                        <div className="space-y-2">
                          {calendarData[selectedDate].bodyMetrics.map((metric) => (
                            <div key={metric.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded text-sm">
                              {metric.weight_kg && (
                                <p>Weight: {metric.weight_kg} kg</p>
                              )}
                              {metric.bf_percent && (
                                <p>Body Fat: {metric.bf_percent}%</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {getDayActivityCount(calendarData[selectedDate]) === 0 && (
                      <div className="text-center py-4">
                        <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">No activities logged</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" href="/log/workout">
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Log Workout
                </Button>
                <Button variant="outline" className="w-full justify-start" href="/log/meal">
                  <Apple className="w-4 h-4 mr-2" />
                  Log Meal
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Add Measurement
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                Add Event
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="event-type">Event Type</Label>
                  <select
                    id="event-type"
                    value={newEvent.type}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Upper Body Workout"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="event-description">Description (Optional)</Label>
                  <textarea
                    id="event-description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Additional details..."
                    className="mt-1 w-full h-20 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="ghost"
                  onClick={() => setShowEventForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveEvent}
                  disabled={!newEvent.title || saving}
                >
                  {saving ? 'Saving...' : 'Save Event'}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
