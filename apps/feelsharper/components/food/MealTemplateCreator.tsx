'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, Search, Star, StarOff, Coffee, Sun, Moon, Cookie } from 'lucide-react';
import Button from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Food, CustomFood, Recipe } from '@/lib/types/database';

interface TemplateItem {
  id: string;
  food_id?: number;
  custom_food_id?: string;
  recipe_id?: string;
  food?: Food;
  custom_food?: CustomFood;
  recipe?: Recipe;
  quantity: number;
  unit: string;
}

interface TemplateData {
  name: string;
  meal_type: string;
  is_favorite: boolean;
  items: TemplateItem[];
}

interface MealTemplateCreatorProps {
  onSave: (template: TemplateData) => Promise<void>;
  trigger?: React.ReactNode;
  initialData?: Partial<TemplateData>;
}

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Breakfast', icon: Coffee },
  { value: 'lunch', label: 'Lunch', icon: Sun },
  { value: 'dinner', label: 'Dinner', icon: Moon },
  { value: 'snack', label: 'Snack', icon: Cookie },
];

export default function MealTemplateCreator({ onSave, trigger, initialData }: MealTemplateCreatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [template, setTemplate] = useState<TemplateData>({
    name: '',
    meal_type: 'breakfast',
    is_favorite: false,
    items: [],
    ...initialData,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<(Food | CustomFood | Recipe)[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const searchItems = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Search foods, custom foods, and recipes
      const [foodsResponse, customFoodsResponse, recipesResponse] = await Promise.all([
        fetch(`/api/nutrition/foods?search=${encodeURIComponent(term)}&limit=5`),
        fetch(`/api/foods/custom?search=${encodeURIComponent(term)}&limit=5`),
        fetch(`/api/recipes?search=${encodeURIComponent(term)}&limit=5`)
      ]);

      const foods = foodsResponse.ok ? (await foodsResponse.json()).foods || [] : [];
      const customFoods = customFoodsResponse.ok ? (await customFoodsResponse.json()).foods || [] : [];
      const recipes = recipesResponse.ok ? (await recipesResponse.json()).recipes || [] : [];

      setSearchResults([...foods, ...customFoods, ...recipes]);
    } catch (error) {
      console.error('Error searching items:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const addItem = (item: Food | CustomFood | Recipe) => {
    const templateItem: TemplateItem = {
      id: generateId(),
      quantity: 100,
      unit: 'g',
    };

    if ('description' in item) {
      // Regular food
      templateItem.food_id = typeof item.id === 'number' ? item.id : parseInt(item.id.toString());
      templateItem.food = item as Food;
    } else if ('name' in item && 'user_id' in item && !('servings' in item)) {
      // Custom food
      templateItem.custom_food_id = item.id as string;
      templateItem.custom_food = item as CustomFood;
      templateItem.quantity = 1;
      templateItem.unit = 'serving';
    } else if ('servings' in item) {
      // Recipe
      templateItem.recipe_id = item.id as string;
      templateItem.recipe = item as unknown as Recipe;
      templateItem.quantity = 1;
      templateItem.unit = 'serving';
    }

    setTemplate(prev => ({
      ...prev,
      items: [...prev.items, templateItem]
    }));
    setSearchTerm('');
    setSearchResults([]);
  };

  const updateItem = (id: string, field: keyof TemplateItem, value: any) => {
    setTemplate(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeItem = (id: string) => {
    setTemplate(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleSave = async () => {
    if (!template.name.trim() || template.items.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(template);
      setIsOpen(false);
      // Reset form
      setTemplate({
        name: '',
        meal_type: 'breakfast',
        is_favorite: false,
        items: [],
      });
    } catch (error) {
      console.error('Error saving template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getItemName = (item: TemplateItem) => {
    return item.food?.description || item.custom_food?.name || item.recipe?.name || 'Unknown';
  };

  const getItemType = (item: TemplateItem) => {
    if (item.food) return 'USDA';
    if (item.custom_food) return 'Custom';
    if (item.recipe) return 'Recipe';
    return 'Unknown';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-navy hover:bg-navy/80">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-surface border-border">
        <DialogHeader>
          <DialogTitle className="text-text-primary">Create Meal Template</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Template Name *
              </label>
              <input
                type="text"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., My Morning Protein"
                className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Meal Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MEAL_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setTemplate(prev => ({ ...prev, meal_type: type.value }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        template.meal_type === type.value
                          ? 'bg-navy/20 border-navy text-navy'
                          : 'bg-bg border-border text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTemplate(prev => ({ ...prev, is_favorite: !prev.is_favorite }))}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                template.is_favorite
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                  : 'bg-bg border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {template.is_favorite ? (
                <Star className="h-4 w-4 fill-current" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
              <span className="text-sm">
                {template.is_favorite ? 'Favorite Template' : 'Mark as Favorite'}
              </span>
            </button>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Items</h3>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchItems(e.target.value);
                }}
                placeholder="Search foods and recipes to add..."
                className="w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy"
              />
              
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-surface border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-50">
                  {searchResults.map((item) => {
                    const name = 'description' in item ? item.description : item.name;
                    const type = 'description' in item ? 'USDA' : 'servings' in item ? 'Recipe' : 'Custom';
                    
                    return (
                      <button
                        key={`${type}-${item.id}`}
                        onClick={() => addItem(item)}
                        className="w-full px-3 py-2 text-left hover:bg-surface-2 text-text-primary"
                      >
                        {name}
                        <span className="text-xs text-text-muted ml-2">{type}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Item List */}
            <div className="space-y-3">
              {template.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-bg border border-border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">
                      {getItemName(item)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {getItemType(item)}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-surface border border-border rounded text-text-primary text-sm"
                      min="0"
                      step="0.1"
                    />
                    <select
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                      className="px-2 py-1 bg-surface border border-border rounded text-text-primary text-sm"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="cup">cup</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="serving">serving</option>
                      <option value="item">item</option>
                    </select>
                    
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {template.items.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  <p>No items added yet. Search and add foods or recipes above.</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!template.name.trim() || template.items.length === 0 || isLoading}
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
                  Save Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}