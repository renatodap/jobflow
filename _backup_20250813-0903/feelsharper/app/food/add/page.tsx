"use client";

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ArrowLeft, Plus, Apple, Calculator, Utensils } from 'lucide-react';
import CustomFoodModal from '@/components/food/CustomFoodModal';
import type { CustomFood } from '@/lib/types/database';

interface Food {
  id: string | number;
  name: string;
  brand: string | null;
  unit: string;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  isCustom?: boolean;
  customFood?: CustomFood;
}

// Mock food data (in real app, this would come from Supabase)
const mockFoods: Food[] = [
  { id: 1, name: "Apple (raw, with skin)", brand: null, unit: "item", kcal: 95, protein_g: 0.5, carbs_g: 25, fat_g: 0.3 },
  { id: 2, name: "Banana (raw)", brand: null, unit: "item", kcal: 105, protein_g: 1.3, carbs_g: 27, fat_g: 0.4 },
  { id: 3, name: "Chicken breast (cooked, no skin)", brand: null, unit: "g", kcal: 1.65, protein_g: 0.31, carbs_g: 0, fat_g: 0.036 },
  { id: 4, name: "Rice (cooked)", brand: null, unit: "g", kcal: 1.3, protein_g: 0.027, carbs_g: 0.28, fat_g: 0.003 },
  { id: 5, name: "Greek yogurt (plain)", brand: null, unit: "g", kcal: 1, protein_g: 0.1, carbs_g: 0.036, fat_g: 0.05 },
];

function AddFoodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedMeal = searchParams?.get('meal') || 'breakfast';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [mealType, setMealType] = useState(preselectedMeal);
  const [filteredFoods, setFilteredFoods] = useState(mockFoods);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [isCustomFoodModalOpen, setIsCustomFoodModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load custom foods on mount
  useEffect(() => {
    loadCustomFoods();
  }, []);

  // Filter foods as user types
  useEffect(() => {
    let filtered = mockFoods;
    let filteredCustom = customFoods;

    if (searchTerm) {
      filtered = mockFoods.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (food.brand !== null && food.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      filteredCustom = customFoods.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (food.brand !== null && food.brand.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Combine USDA and custom foods, with custom foods first
    const allFoods = [
      ...filteredCustom.map(food => ({
        id: `custom-${food.id}`,
        name: food.name,
        brand: food.brand,
        unit: food.serving_unit || 'g',
        kcal: food.calories_per_serving || 0,
        protein_g: food.protein_g || 0,
        carbs_g: food.carbs_g || 0,
        fat_g: food.fat_g || 0,
        isCustom: true,
        customFood: food
      })),
      ...filtered.map(food => ({
        ...food,
        id: `usda-${food.id}`,
        isCustom: false
      }))
    ];

    setFilteredFoods(allFoods);
  }, [searchTerm, customFoods]);

  const loadCustomFoods = async () => {
    try {
      const response = await fetch('/api/foods/custom');
      if (response.ok) {
        const data = await response.json();
        setCustomFoods(data.foods || []);
      }
    } catch (error) {
      console.error('Failed to load custom foods:', error);
    }
  };

  const handleCustomFoodSave = (newFood: CustomFood) => {
    setCustomFoods(prev => [...prev, newFood]);
  };

  // Calculate nutrition based on quantity
  const calculatedNutrition = selectedFood ? {
    kcal: Math.round((selectedFood.kcal * parseFloat(quantity || '0')) * 100) / 100,
    protein: Math.round((selectedFood.protein_g * parseFloat(quantity || '0')) * 100) / 100,
    carbs: Math.round((selectedFood.carbs_g * parseFloat(quantity || '0')) * 100) / 100,
    fat: Math.round((selectedFood.fat_g * parseFloat(quantity || '0')) * 100) / 100,
  } : null;

  const handleFoodSelect = (food: Food) => {
    setSelectedFood(food);
    setQuantity(food.unit === 'g' ? '100' : '1'); // Default quantities
  };

  const handleSave = async () => {
    if (!selectedFood || !quantity) return;

    // In real app, save to Supabase here
    console.log('Saving food entry:', {
      food: selectedFood,
      quantity: parseFloat(quantity),
      mealType,
      nutrition: calculatedNutrition
    });

    // Navigate back to food page
    router.push('/food');
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-surface-2 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Log Food</h1>
            <p className="text-text-secondary">Search and add food to your diary</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Food Search */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              <input
                type="text"
                placeholder="Search for foods..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-focus"
                autoFocus
              />
            </div>

            {/* Food Results */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFoods.length === 0 ? (
                <div className="text-center py-8">
                  <Apple className="w-12 h-12 text-text-muted mx-auto mb-4" />
                  <p className="text-text-secondary">No foods found</p>
                  <p className="text-text-muted text-sm">Try a different search term</p>
                </div>
              ) : (
                filteredFoods.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => handleFoodSelect(food)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedFood?.id === food.id
                        ? 'bg-navy/20 border-navy'
                        : 'bg-surface border-border hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-text-primary">{food.name}</h3>
                          {food.isCustom && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-navy/20 text-navy">
                              <Utensils className="w-3 h-3" />
                              Custom
                            </span>
                          )}
                        </div>
                        {food.brand && (
                          <p className="text-sm text-text-muted">{food.brand}</p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <p className="text-text-primary font-medium">
                          {food.kcal} cal/{food.unit}
                        </p>
                        <p className="text-text-muted">
                          P{food.protein_g}g C{food.carbs_g}g F{food.fat_g}g
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Create Custom Food */}
            <button 
              onClick={() => setIsCustomFoodModalOpen(true)}
              className="w-full p-4 border-2 border-dashed border-border rounded-xl text-text-secondary hover:bg-surface-2 hover:border-navy transition-all"
            >
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <span>Create custom food</span>
            </button>
            
          </div>

          {/* Food Entry Panel */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-6 h-fit sticky top-8">
            
            {selectedFood ? (
              <>
                {/* Selected Food */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">{selectedFood.name}</h3>
                  {selectedFood.brand && (
                    <p className="text-text-muted text-sm">{selectedFood.brand}</p>
                  )}
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-2">
                    Quantity ({selectedFood.unit})
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
                    min="0"
                    step="0.1"
                  />
                </div>

                {/* Meal Type */}
                <div>
                  <label className="block text-text-secondary text-sm font-medium mb-2">
                    Meal
                  </label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-2 border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-focus"
                  >
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                  </select>
                </div>

                {/* Calculated Nutrition */}
                {calculatedNutrition && (
                  <div>
                    <h4 className="text-text-secondary text-sm font-medium mb-3 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Nutrition Summary
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-muted">Calories:</span>
                        <span className="font-medium">{calculatedNutrition.kcal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Protein:</span>
                        <span className="font-medium">{calculatedNutrition.protein}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Carbs:</span>
                        <span className="font-medium">{calculatedNutrition.carbs}g</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-muted">Fat:</span>
                        <span className="font-medium">{calculatedNutrition.fat}g</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={handleSave}
                  disabled={!quantity || parseFloat(quantity) <= 0}
                  className="w-full px-4 py-3 bg-success text-white rounded-xl hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Add to {mealType}
                </button>
                
              </>
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <p className="text-text-secondary">Select a food to continue</p>
                <p className="text-text-muted text-sm">Search and click on a food item</p>
              </div>
            )}
            
          </div>
          
        </div>
      </div>

      {/* Custom Food Modal */}
      <CustomFoodModal
        isOpen={isCustomFoodModalOpen}
        onClose={() => setIsCustomFoodModalOpen(false)}
        onSave={handleCustomFoodSave}
      />
    </div>
  );
}

export default function AddFoodPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg text-text-primary flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-navy border-t-transparent mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    }>
      <AddFoodContent />
    </Suspense>
  );
}