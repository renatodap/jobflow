"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Plus } from 'lucide-react';
import type { CustomFood } from '@/lib/types/database';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (food: CustomFood) => void;
  editFood?: CustomFood | null;
}

interface FormData {
  name: string;
  brand: string;
  serving_size: string;
  serving_unit: string;
  calories_per_serving: string;
  protein_g: string;
  carbs_g: string;
  fat_g: string;
  fiber_g: string;
  sugar_g: string;
  sodium_mg: string;
  is_recipe: boolean;
  notes: string;
}

export default function CustomFoodModal({ isOpen, onClose, onSave, editFood }: CustomFoodModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>(() => ({
    name: editFood?.name || '',
    brand: editFood?.brand || '',
    serving_size: editFood?.serving_size?.toString() || '100',
    serving_unit: editFood?.serving_unit || 'g',
    calories_per_serving: editFood?.calories_per_serving?.toString() || '',
    protein_g: editFood?.protein_g?.toString() || '',
    carbs_g: editFood?.carbs_g?.toString() || '',
    fat_g: editFood?.fat_g?.toString() || '',
    fiber_g: editFood?.fiber_g?.toString() || '',
    sugar_g: editFood?.sugar_g?.toString() || '',
    sodium_mg: editFood?.sodium_mg?.toString() || '',
    is_recipe: editFood?.is_recipe || false,
    notes: editFood?.notes || '',
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const url = editFood 
        ? `/api/foods/custom/${editFood.id}`
        : '/api/foods/custom';
      
      const method = editFood ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save custom food');
      }

      onSave(data.food);
      onClose();
      
      // Reset form for next use
      setFormData({
        name: '',
        brand: '',
        serving_size: '100',
        serving_unit: 'g',
        calories_per_serving: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        fiber_g: '',
        sugar_g: '',
        sodium_mg: '',
        is_recipe: false,
        notes: '',
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save food');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editFood ? (
              <>
                <Save className="w-5 h-5" />
                Edit Custom Food
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Custom Food
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Food Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Homemade Protein Smoothie"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="brand" className="text-sm font-medium">
                  Brand (optional)
                </Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  placeholder="e.g., My Kitchen"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serving_size" className="text-sm font-medium">
                  Serving Size
                </Label>
                <Input
                  id="serving_size"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.serving_size}
                  onChange={(e) => handleInputChange('serving_size', e.target.value)}
                  placeholder="100"
                />
              </div>
              
              <div>
                <Label htmlFor="serving_unit" className="text-sm font-medium">
                  Unit
                </Label>
                <Input
                  id="serving_unit"
                  value={formData.serving_unit}
                  onChange={(e) => handleInputChange('serving_unit', e.target.value)}
                  placeholder="g, ml, cup, piece"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.is_recipe}
                onCheckedChange={(checked) => handleInputChange('is_recipe', !!checked)}
              />
              <Label className="text-sm">This is a recipe (multiple ingredients)</Label>
            </div>
          </div>

          {/* Nutrition Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Nutrition Information</h3>
            <p className="text-sm text-gray-600">Per serving amount specified above</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories" className="text-sm font-medium">
                  Calories
                </Label>
                <Input
                  id="calories"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.calories_per_serving}
                  onChange={(e) => handleInputChange('calories_per_serving', e.target.value)}
                  placeholder="250"
                />
              </div>
              
              <div>
                <Label htmlFor="protein" className="text-sm font-medium">
                  Protein (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.protein_g}
                  onChange={(e) => handleInputChange('protein_g', e.target.value)}
                  placeholder="20"
                />
              </div>
              
              <div>
                <Label htmlFor="carbs" className="text-sm font-medium">
                  Carbs (g)
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.carbs_g}
                  onChange={(e) => handleInputChange('carbs_g', e.target.value)}
                  placeholder="15"
                />
              </div>
              
              <div>
                <Label htmlFor="fat" className="text-sm font-medium">
                  Fat (g)
                </Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.fat_g}
                  onChange={(e) => handleInputChange('fat_g', e.target.value)}
                  placeholder="8"
                />
              </div>
              
              <div>
                <Label htmlFor="fiber" className="text-sm font-medium">
                  Fiber (g)
                </Label>
                <Input
                  id="fiber"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.fiber_g}
                  onChange={(e) => handleInputChange('fiber_g', e.target.value)}
                  placeholder="3"
                />
              </div>
              
              <div>
                <Label htmlFor="sugar" className="text-sm font-medium">
                  Sugar (g)
                </Label>
                <Input
                  id="sugar"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.sugar_g}
                  onChange={(e) => handleInputChange('sugar_g', e.target.value)}
                  placeholder="10"
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="sodium" className="text-sm font-medium">
                  Sodium (mg)
                </Label>
                <Input
                  id="sodium"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.sodium_mg}
                  onChange={(e) => handleInputChange('sodium_mg', e.target.value)}
                  placeholder="150"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Ingredients, preparation notes, etc."
              className="h-20"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="bg-navy hover:bg-navy-600"
            >
              {isLoading ? 'Saving...' : editFood ? 'Update Food' : 'Create Food'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}