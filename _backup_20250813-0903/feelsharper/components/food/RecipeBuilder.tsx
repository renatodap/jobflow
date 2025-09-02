'use client';

import { useState } from 'react';
import { Plus, Trash2, Clock, Users, Save, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Food, CustomFood } from '@/lib/types/database';

interface RecipeIngredient {
  id: string;
  food_id?: number;
  custom_food_id?: string;
  food?: Food;
  custom_food?: CustomFood;
  quantity: number;
  unit: string;
  notes?: string;
}

interface RecipeData {
  name: string;
  description: string;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  instructions: string[];
  tags: string[];
  ingredients: RecipeIngredient[];
  is_public: boolean;
}

interface RecipeBuilderProps {
  onSave: (recipe: RecipeData) => Promise<void>;
  trigger?: React.ReactNode;
  initialData?: Partial<RecipeData>;
}

export default function RecipeBuilder({ onSave, trigger, initialData }: RecipeBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeData>({
    name: '',
    description: '',
    servings: 1,
    prep_time_minutes: 0,
    cook_time_minutes: 0,
    instructions: [''],
    tags: [],
    ingredients: [],
    is_public: false,
    ...initialData,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Food | CustomFood)[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const searchFoods = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search both regular foods and custom foods
      const [foodsResponse, customFoodsResponse] = await Promise.all([
        fetch(`/api/nutrition/foods?search=${encodeURIComponent(term)}&limit=10`),
        fetch(`/api/foods/custom?search=${encodeURIComponent(term)}&limit=5`)
      ]);

      const foods = foodsResponse.ok ? (await foodsResponse.json()).foods || [] : [];
      const customFoods = customFoodsResponse.ok ? (await customFoodsResponse.json()).foods || [] : [];

      setSearchResults([...foods, ...customFoods]);
    } catch (error) {
      console.error('Error searching foods:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addIngredient = (food: Food | CustomFood) => {
    const ingredient: RecipeIngredient = {
      id: generateId(),
      quantity: 100,
      unit: 'g',
      notes: '',
    };

    if ('description' in food) {
      // Regular food
      ingredient.food_id = food.id;
      ingredient.food = food;
    } else {
      // Custom food
      ingredient.custom_food_id = food.id;
      ingredient.custom_food = food;
    }

    setRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ingredient]
    }));
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateIngredient = (id: string, field: keyof RecipeIngredient, value: any) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const removeIngredient = (id: string) => {
    setRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ing => ing.id !== id)
    }));
  };

  const addInstruction = () => {
    setRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => i === index ? value : inst)
    }));
  };

  const removeInstruction = (index: number) => {
    setRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    if (!recipe.name.trim() || recipe.ingredients.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(recipe);
      setIsOpen(false);
      // Reset form
      setRecipe({
        name: '',
        description: '',
        servings: 1,
        prep_time_minutes: 0,
        cook_time_minutes: 0,
        instructions: [''],
        tags: [],
        ingredients: [],
        is_public: false,
      });
    } catch (error) {
      console.error('Error saving recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-navy hover:bg-navy/80">
            <Plus className="h-4 w-4 mr-2" />
            Create Recipe
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Create Recipe</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Recipe Name *
              </label>
              <input
                type="text"
                value={recipe.name}
                onChange={(e) => setRecipe(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Protein Pancakes"
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <Users className="h-4 w-4 inline mr-1" />
                  Servings
                </label>
                <input
                  type="number"
                  value={recipe.servings}
                  onChange={(e) => setRecipe(prev => ({ ...prev, servings: parseInt(e.target.value) || 1 }))}
                  min="1"
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Total Time (min)
                </label>
                <input
                  type="number"
                  value={recipe.prep_time_minutes + recipe.cook_time_minutes}
                  onChange={(e) => {
                    const total = parseInt(e.target.value) || 0;
                    setRecipe(prev => ({ 
                      ...prev, 
                      prep_time_minutes: Math.floor(total * 0.3),
                      cook_time_minutes: Math.ceil(total * 0.7)
                    }));
                  }}
                  min="0"
                  className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              value={recipe.description}
              onChange={(e) => setRecipe(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your recipe..."
              rows={2}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy resize-none"
            />
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Ingredients</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchFoods(e.target.value);
                }}
                placeholder="Search foods to add..."
                className="w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-surface border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-50">
                  {searchResults.map((food) => (
                    <button
                      key={`${'description' in food ? 'food' : 'custom'}-${food.id}`}
                      onClick={() => addIngredient(food)}
                      className="w-full px-3 py-2 text-left hover:bg-surface-2 text-text-primary"
                    >
                      {'description' in food ? food.description : food.name}
                      <span className="text-xs text-text-muted ml-2">
                        {'description' in food ? 'USDA' : 'Custom'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredient List */}
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient) => (
                <div key={ingredient.id} className="flex items-center gap-3 p-3 bg-bg border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">
                      {ingredient.food?.description || ingredient.custom_food?.name}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(ingredient.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-surface border border-border rounded text-text-primary text-sm"
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                      className="px-2 py-1 bg-surface border border-border rounded text-text-primary text-sm"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="cup">cup</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="item">item</option>
                    </select>
                    
                    <button
                      onClick={() => removeIngredient(ingredient.id)}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Instructions</h3>
            <div className="space-y-3">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-sm font-medium text-text-secondary mt-2 min-w-[24px]">
                    {index + 1}.
                  </span>
                  <textarea
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    placeholder={`Step ${index + 1}...`}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy resize-none"
                  />
                  {recipe.instructions.length > 1 && (
                    <button
                      onClick={() => removeInstruction(index)}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={addInstruction}
                className="text-navy hover:text-navy/80 text-sm font-medium"
              >
                + Add step
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={recipe.is_public}
                onChange={(e) => setRecipe(prev => ({ ...prev, is_public: e.target.checked }))}
                className="rounded border-border text-navy focus:ring-navy"
              />
              <span className="text-sm text-text-primary">Make public</span>
            </label>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!recipe.name.trim() || recipe.ingredients.length === 0 || isLoading}
                className="bg-navy hover:bg-navy/80"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Recipe
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}