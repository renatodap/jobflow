"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Apple, 
  Plus, 
  Search, 
  Trash2, 
  Calculator,
  Target,
  Save
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FoodItem {
  id?: string;
  food_name: string;
  qty: number;
  unit: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  source: 'manual' | 'database';
}

interface Meal {
  id?: string;
  name: string;
  eaten_at: string;
  items: FoodItem[];
  notes?: string;
}

// Common foods database (simplified)
const COMMON_FOODS = [
  { name: 'Chicken Breast (100g)', kcal: 165, protein: 31, carbs: 0, fat: 3.6, unit: '100g' },
  { name: 'Salmon (100g)', kcal: 208, protein: 20, carbs: 0, fat: 12, unit: '100g' },
  { name: 'Eggs (1 large)', kcal: 70, protein: 6, carbs: 0.6, fat: 5, unit: 'piece' },
  { name: 'Greek Yogurt (100g)', kcal: 59, protein: 10, carbs: 3.6, fat: 0.4, unit: '100g' },
  { name: 'Whey Protein (1 scoop)', kcal: 120, protein: 25, carbs: 2, fat: 1, unit: 'scoop' },
  { name: 'Rice (100g cooked)', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: '100g' },
  { name: 'Oats (100g)', kcal: 389, protein: 17, carbs: 66, fat: 7, unit: '100g' },
  { name: 'Banana (1 medium)', kcal: 105, protein: 1.3, carbs: 27, fat: 0.4, unit: 'piece' },
  { name: 'Avocado (100g)', kcal: 160, protein: 2, carbs: 9, fat: 15, unit: '100g' },
  { name: 'Almonds (30g)', kcal: 170, protein: 6, carbs: 6, fat: 15, unit: '30g' },
];

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast' },
  { id: 'lunch', name: 'Lunch' },
  { id: 'dinner', name: 'Dinner' },
  { id: 'snack', name: 'Snack' },
];

export default function NutritionTracker() {
  const [currentMeal, setCurrentMeal] = useState<Meal>({
    name: 'Breakfast',
    eaten_at: new Date().toISOString(),
    items: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState(COMMON_FOODS);
  const [customFood, setCustomFood] = useState<Partial<FoodItem>>({});
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [dailyNutrition, setDailyNutrition] = useState({
    calories: 0, protein: 0, carbs: 0, fat: 0
  });
  const [nutritionTargets] = useState({
    calories: 2200, protein: 150, carbs: 275, fat: 73
  });
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTodayMeals();
  }, []);

  useEffect(() => {
    const filtered = COMMON_FOODS.filter(food =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFoods(filtered);
  }, [searchQuery]);

  useEffect(() => {
    calculateDailyNutrition();
  }, [todayMeals, currentMeal]);

  const loadTodayMeals = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      
      const { data: meals } = await supabase
        .from('meals')
        .select('*, meal_items(*)')
        .eq('user_id', user.id)
        .gte('eaten_at', `${today}T00:00:00`)
        .lt('eaten_at', `${today}T23:59:59`)
        .order('eaten_at', { ascending: true });

      if (meals) {
        const formattedMeals = meals.map(meal => ({
          id: meal.id,
          name: meal.name,
          eaten_at: meal.eaten_at,
          items: meal.meal_items.map((item: any) => ({
            id: item.id,
            food_name: item.food_name,
            qty: item.qty,
            unit: item.unit,
            kcal: item.kcal,
            protein_g: item.protein_g,
            carbs_g: item.carbs_g,
            fat_g: item.fat_g,
            source: item.source
          })),
          notes: meal.notes
        }));
        setTodayMeals(formattedMeals);
      }
    } catch (error) {
      console.error('Error loading today meals:', error);
    }
  };

  const calculateDailyNutrition = () => {
    const allItems = [
      ...todayMeals.flatMap(meal => meal.items),
      ...currentMeal.items
    ];

    const totals = allItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.kcal || 0),
        protein: acc.protein + (item.protein_g || 0),
        carbs: acc.carbs + (item.carbs_g || 0),
        fat: acc.fat + (item.fat_g || 0)
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    setDailyNutrition(totals);
  };

  const addFoodToMeal = (food: any, quantity: number = 1) => {
    const newItem: FoodItem = {
      id: Date.now().toString(),
      food_name: food.name,
      qty: quantity,
      unit: food.unit,
      kcal: Math.round(food.kcal * quantity),
      protein_g: Math.round(food.protein * quantity * 10) / 10,
      carbs_g: Math.round(food.carbs * quantity * 10) / 10,
      fat_g: Math.round(food.fat * quantity * 10) / 10,
      source: 'database'
    };

    setCurrentMeal(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setSearchQuery('');
  };

  const addCustomFood = () => {
    if (!customFood.food_name || !customFood.kcal) return;

    const newItem: FoodItem = {
      id: Date.now().toString(),
      food_name: customFood.food_name,
      qty: customFood.qty || 1,
      unit: customFood.unit || 'serving',
      kcal: customFood.kcal,
      protein_g: customFood.protein_g || 0,
      carbs_g: customFood.carbs_g || 0,
      fat_g: customFood.fat_g || 0,
      source: 'manual'
    };

    setCurrentMeal(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    setCustomFood({});
    setShowCustomForm(false);
  };

  const removeFoodFromMeal = (itemId: string) => {
    setCurrentMeal(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const updateFoodQuantity = (itemId: string, newQty: number) => {
    setCurrentMeal(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === itemId) {
          const multiplier = newQty / item.qty;
          return {
            ...item,
            qty: newQty,
            kcal: Math.round(item.kcal * multiplier),
            protein_g: Math.round(item.protein_g * multiplier * 10) / 10,
            carbs_g: Math.round(item.carbs_g * multiplier * 10) / 10,
            fat_g: Math.round(item.fat_g * multiplier * 10) / 10
          };
        }
        return item;
      })
    }));
  };

  const saveMeal = async () => {
    if (currentMeal.items.length === 0) return;

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const mealTotals = currentMeal.items.reduce(
        (acc, item) => ({
          kcal: acc.kcal + item.kcal,
          protein_g: acc.protein_g + item.protein_g,
          carbs_g: acc.carbs_g + item.carbs_g,
          fat_g: acc.fat_g + item.fat_g
        }),
        { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
      );

      const mealData = {
        user_id: user.id,
        eaten_at: currentMeal.eaten_at,
        name: currentMeal.name,
        kcal: Math.round(mealTotals.kcal),
        protein_g: Math.round(mealTotals.protein_g * 10) / 10,
        carbs_g: Math.round(mealTotals.carbs_g * 10) / 10,
        fat_g: Math.round(mealTotals.fat_g * 10) / 10,
        notes: currentMeal.notes
      };

      const { data: mealResult, error: mealError } = await supabase
        .from('meals')
        .insert(mealData)
        .select()
        .single();

      if (mealError) throw mealError;

      const itemsData = currentMeal.items.map(item => ({
        meal_id: mealResult.id,
        food_name: item.food_name,
        qty: item.qty,
        unit: item.unit,
        kcal: item.kcal,
        protein_g: item.protein_g,
        carbs_g: item.carbs_g,
        fat_g: item.fat_g,
        source: item.source
      }));

      const { error: itemsError } = await supabase
        .from('meal_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;

      setCurrentMeal({
        name: 'Breakfast',
        eaten_at: new Date().toISOString(),
        items: []
      });

      await loadTodayMeals();
      alert('Meal saved successfully!');
    } catch (error) {
      console.error('Error saving meal:', error);
      alert('Error saving meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getMealProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCurrentMealTotals = () => {
    return currentMeal.items.reduce(
      (acc, item) => ({
        kcal: acc.kcal + item.kcal,
        protein_g: acc.protein_g + item.protein_g,
        carbs_g: acc.carbs_g + item.carbs_g,
        fat_g: acc.fat_g + item.fat_g
      }),
      { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    );
  };

  const currentMealTotals = getCurrentMealTotals();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Nutrition Tracker
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Track your meals and hit your macro targets
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Overview */}
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Today's Progress</h3>
                <Target className="w-5 h-5 text-amber-600" />
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Calories</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {Math.round(dailyNutrition.calories)} / {nutritionTargets.calories}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getMealProgress(dailyNutrition.calories, nutritionTargets.calories)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Protein</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {Math.round(dailyNutrition.protein)}g / {nutritionTargets.protein}g
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getMealProgress(dailyNutrition.protein, nutritionTargets.protein)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Carbs</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {Math.round(dailyNutrition.carbs)}g / {nutritionTargets.carbs}g
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getMealProgress(dailyNutrition.carbs, nutritionTargets.carbs)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">Fat</span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {Math.round(dailyNutrition.fat)}g / {nutritionTargets.fat}g
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getMealProgress(dailyNutrition.fat, nutritionTargets.fat)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Today's Meals */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Today's Meals</h3>
              
              {todayMeals.length > 0 ? (
                <div className="space-y-3">
                  {todayMeals.map((meal) => (
                    <div key={meal.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-100">{meal.name}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(meal.eaten_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {meal.items.reduce((sum, item) => sum + item.kcal, 0)} cal
                          </p>
                          <p className="text-xs text-slate-500">
                            {meal.items.length} items
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Apple className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No meals logged today</p>
                </div>
              )}
            </Card>
          </div>

          {/* Current Meal */}
          <div className="lg:col-span-2">
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Current Meal</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={currentMeal.name}
                    onChange={(e) => setCurrentMeal(prev => ({ ...prev, name: e.target.value }))}
                    className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                  >
                    {MEAL_TYPES.map(type => (
                      <option key={type.id} value={type.name}>{type.name}</option>
                    ))}
                  </select>
                  <Button
                    onClick={saveMeal}
                    disabled={currentMeal.items.length === 0 || saving}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Meal'}</span>
                  </Button>
                </div>
              </div>

              {/* Current Meal Summary */}
              {currentMeal.items.length > 0 && (
                <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(currentMealTotals.kcal)}
                      </p>
                      <p className="text-xs text-slate-500">Calories</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">
                        {Math.round(currentMealTotals.protein_g)}g
                      </p>
                      <p className="text-xs text-slate-500">Protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {Math.round(currentMealTotals.carbs_g)}g
                      </p>
                      <p className="text-xs text-slate-500">Carbs</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">
                        {Math.round(currentMealTotals.fat_g)}g
                      </p>
                      <p className="text-xs text-slate-500">Fat</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Food Items */}
              {currentMeal.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Items in this meal:</h4>
                  <div className="space-y-2">
                    {currentMeal.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{item.food_name}</p>
                          <p className="text-sm text-slate-500">
                            {item.kcal} cal • {item.protein_g}g protein • {item.carbs_g}g carbs • {item.fat_g}g fat
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateFoodQuantity(item.id!, parseFloat(e.target.value) || 1)}
                            className="w-20 h-8 text-sm"
                            min="0.1"
                            step="0.1"
                          />
                          <span className="text-sm text-slate-500">{item.unit}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFoodFromMeal(item.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Food Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="food-search">Search for food</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="food-search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., chicken breast, rice, banana..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Food Search Results */}
                {searchQuery && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {filteredFoods.slice(0, 8).map((food, index) => (
                      <button
                        key={index}
                        onClick={() => addFoodToMeal(food)}
                        className="p-3 text-left border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <p className="font-medium text-slate-900 dark:text-slate-100">{food.name}</p>
                        <p className="text-sm text-slate-500">
                          {food.kcal} cal • {food.protein}g protein
                        </p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Food Form */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowCustomForm(!showCustomForm)}
                    className="flex items-center space-x-2"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Add Custom Food</span>
                  </Button>

                  {showCustomForm && (
                    <div className="mt-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="custom-name">Food Name</Label>
                          <Input
                            id="custom-name"
                            value={customFood.food_name || ''}
                            onChange={(e) => setCustomFood(prev => ({ ...prev, food_name: e.target.value }))}
                            placeholder="e.g., Homemade Pasta"
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-qty">Quantity & Unit</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="custom-qty"
                              type="number"
                              value={customFood.qty || ''}
                              onChange={(e) => setCustomFood(prev => ({ ...prev, qty: parseFloat(e.target.value) || 1 }))}
                              placeholder="1"
                              className="flex-1"
                            />
                            <Input
                              value={customFood.unit || ''}
                              onChange={(e) => setCustomFood(prev => ({ ...prev, unit: e.target.value }))}
                              placeholder="serving"
                              className="w-24"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <Label htmlFor="custom-calories">Calories</Label>
                          <Input
                            id="custom-calories"
                            type="number"
                            value={customFood.kcal || ''}
                            onChange={(e) => setCustomFood(prev => ({ ...prev, kcal: parseInt(e.target.value) || 0 }))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="custom-protein">Protein (g)</Label>
                          <Input
                            id="custom-protein"
                            type="number"
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
                            value={customFood.fat_g || ''}
                            onChange={(e) => setCustomFood(prev => ({ ...prev, fat_g: parseFloat(e.target.value) || 0 }))}
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={addCustomFood}
                        disabled={!customFood.food_name || !customFood.kcal}
                        className="w-full"
                      >
                        Add Custom Food
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
