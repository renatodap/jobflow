"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Search, 
  Trash2, 
  Target,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Food {
  id: string;
  name: string;
  brand?: string;
  unit: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sugar_g?: number;
  sodium_mg?: number;
  verified_source: boolean;
}

interface DiaryEntry {
  id: string;
  date: string;
  meal_type: string;
  quantity: number;
  notes?: string;
  nutrients_snapshot: {
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  };
  foods?: Food;
}

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
  { id: 'lunch', name: 'Lunch', icon: '☀️' },
  { id: 'dinner', name: 'Dinner', icon: '🌙' },
  { id: 'snack', name: 'Snack', icon: '🍎' },
];

export default function NutritionTrackerV2() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<Record<string, DiaryEntry[]>>({});
  const [loading, setLoading] = useState(false);
  const [showAddFood, setShowAddFood] = useState(false);
  const [customFood, setCustomFood] = useState<Partial<Food>>({
    unit: 'g',
    kcal: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0
  });

  // Nutrition targets (could be user-configurable)
  const [targets] = useState({
    kcal: 2200,
    protein_g: 150,
    carbs_g: 275,
    fat_g: 73
  });

  useEffect(() => {
    loadDiaryEntries();
  }, [selectedDate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchFoods();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDiaryEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/nutrition/diary?date=${selectedDate}`);
      const data = await response.json();
      
      if (response.ok) {
        setDiaryEntries(data.entries || {});
      }
    } catch (error) {
      console.error('Failed to load diary entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchFoods = async () => {
    try {
      const response = await fetch(`/api/nutrition/foods?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      
      if (response.ok) {
        setSearchResults(data.foods || []);
      }
    } catch (error) {
      console.error('Failed to search foods:', error);
    }
  };

  const addFoodToDiary = async (food: Food, quantity: number = 1) => {
    try {
      const response = await fetch('/api/nutrition/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          meal_type: selectedMealType,
          food_id: food.id,
          quantity
        })
      });

      if (response.ok) {
        await loadDiaryEntries();
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Failed to add food:', error);
    }
  };

  const addCustomFood = async () => {
    try {
      // First create the custom food
      const createResponse = await fetch('/api/nutrition/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customFood)
      });

      if (createResponse.ok) {
        const { food } = await createResponse.json();
        
        // Then add it to diary
        await addFoodToDiary(food, 1);
        
        // Reset form
        setCustomFood({
          unit: 'g',
          kcal: 0,
          protein_g: 0,
          carbs_g: 0,
          fat_g: 0
        });
        setShowAddFood(false);
      }
    } catch (error) {
      console.error('Failed to add custom food:', error);
    }
  };

  const removeFromDiary = async (entryId: string) => {
    try {
      const response = await fetch(`/api/nutrition/diary?id=${entryId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadDiaryEntries();
      }
    } catch (error) {
      console.error('Failed to remove entry:', error);
    }
  };

  const calculateDailyTotals = () => {
    const totals = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    
    Object.values(diaryEntries).flat().forEach(entry => {
      totals.kcal += parseFloat(entry.nutrients_snapshot.kcal.toString());
      totals.protein_g += parseFloat(entry.nutrients_snapshot.protein_g.toString());
      totals.carbs_g += parseFloat(entry.nutrients_snapshot.carbs_g.toString());
      totals.fat_g += parseFloat(entry.nutrients_snapshot.fat_g.toString());
    });

    return totals;
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const dailyTotals = calculateDailyTotals();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Nutrition Tracker
          </h1>
          <div className="flex items-center space-x-4">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-auto"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              Track your daily nutrition and hit your macro targets
            </span>
          </div>
        </div>

        {/* Daily Summary */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="h-5 w-5 mr-2 text-amber-500" />
              Daily Progress
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'kcal', label: 'Calories', unit: '', color: 'bg-blue-500' },
                { key: 'protein_g', label: 'Protein', unit: 'g', color: 'bg-red-500' },
                { key: 'carbs_g', label: 'Carbs', unit: 'g', color: 'bg-green-500' },
                { key: 'fat_g', label: 'Fat', unit: 'g', color: 'bg-yellow-500' }
              ].map(({ key, label, unit, color }) => {
                const current = dailyTotals[key as keyof typeof dailyTotals];
                const target = targets[key as keyof typeof targets];
                const percentage = getProgressPercentage(current, target);
                
                return (
                  <div key={key} className="text-center">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                      {label}
                    </div>
                    <div className="text-lg font-semibold mb-2">
                      {Math.round(current)}{unit} / {target}{unit}
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={cn("h-2 rounded-full transition-all", color)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {Math.round(percentage)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Add Food */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-500" />
                Add Food
              </h2>

              {/* Meal Type Selector */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Meal</Label>
                <div className="grid grid-cols-2 gap-2">
                  {MEAL_TYPES.map(meal => (
                    <button
                      key={meal.id}
                      onClick={() => setSelectedMealType(meal.id)}
                      className={cn(
                        "p-3 rounded-lg border text-sm font-medium transition-colors",
                        selectedMealType === meal.id
                          ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-100"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                      )}
                    >
                      <span className="mr-2">{meal.icon}</span>
                      {meal.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Food Search */}
              <div className="mb-4">
                <Label htmlFor="food-search" className="text-sm font-medium mb-2 block">
                  Search Foods
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="food-search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for foods..."
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mb-4 max-h-48 overflow-y-auto border rounded-lg">
                  {searchResults.map(food => (
                    <div
                      key={food.id}
                      className="p-3 border-b last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      onClick={() => addFoodToDiary(food)}
                    >
                      <div className="font-medium text-sm">
                        {food.name}
                        {food.brand && <span className="text-slate-500 ml-1">({food.brand})</span>}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {Math.round(food.kcal)} cal, {food.protein_g}g protein per {food.unit}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Custom Food */}
              <div className="border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddFood(!showAddFood)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Food
                </Button>

                {showAddFood && (
                  <div className="mt-4 space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div>
                      <Label htmlFor="custom-name">Food Name</Label>
                      <Input
                        id="custom-name"
                        value={customFood.name || ''}
                        onChange={(e) => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Homemade Pasta"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="custom-unit">Unit</Label>
                        <Input
                          id="custom-unit"
                          value={customFood.unit || 'g'}
                          onChange={(e) => setCustomFood(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="g, ml, piece"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-calories">Calories</Label>
                        <Input
                          id="custom-calories"
                          type="number"
                          value={customFood.kcal || ''}
                          onChange={(e) => setCustomFood(prev => ({ ...prev, kcal: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="custom-protein">Protein (g)</Label>
                        <Input
                          id="custom-protein"
                          type="number"
                          step="0.1"
                          value={customFood.protein_g || ''}
                          onChange={(e) => setCustomFood(prev => ({ ...prev, protein_g: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-carbs">Carbs (g)</Label>
                        <Input
                          id="custom-carbs"
                          type="number"
                          step="0.1"
                          value={customFood.carbs_g || ''}
                          onChange={(e) => setCustomFood(prev => ({ ...prev, carbs_g: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="custom-fat">Fat (g)</Label>
                        <Input
                          id="custom-fat"
                          type="number"
                          step="0.1"
                          value={customFood.fat_g || ''}
                          onChange={(e) => setCustomFood(prev => ({ ...prev, fat_g: parseFloat(e.target.value) || 0 }))}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={addCustomFood}
                        disabled={!customFood.name || !customFood.kcal}
                        size="sm"
                        className="flex-1"
                      >
                        Add Food
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddFood(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Today's Meals */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Today's Meals
              </h2>

              {loading ? (
                <div className="text-center py-8 text-slate-500">Loading...</div>
              ) : (
                <div className="space-y-4">
                  {MEAL_TYPES.map(mealType => {
                    const entries = diaryEntries[mealType.id] || [];
                    const mealTotals = entries.reduce((acc, entry) => ({
                      kcal: acc.kcal + parseFloat(entry.nutrients_snapshot.kcal.toString()),
                      protein_g: acc.protein_g + parseFloat(entry.nutrients_snapshot.protein_g.toString())
                    }), { kcal: 0, protein_g: 0 });

                    return (
                      <div key={mealType.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium flex items-center">
                            <span className="mr-2">{mealType.icon}</span>
                            {mealType.name}
                          </h3>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {Math.round(mealTotals.kcal)} cal, {Math.round(mealTotals.protein_g)}g protein
                          </div>
                        </div>

                        {entries.length === 0 ? (
                          <div className="text-sm text-slate-500 italic">No foods logged</div>
                        ) : (
                          <div className="space-y-2">
                            {entries.map(entry => (
                              <div key={entry.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded p-2">
                                <div className="flex-1">
                                  <div className="text-sm font-medium">
                                    {entry.foods?.name}
                                    {entry.foods?.brand && (
                                      <span className="text-slate-500 ml-1">({entry.foods.brand})</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-slate-600 dark:text-slate-400">
                                    {entry.quantity} {entry.foods?.unit} • {Math.round(parseFloat(entry.nutrients_snapshot.kcal.toString()))} cal
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromDiary(entry.id)}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
