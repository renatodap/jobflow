'use client';

import { useState, useEffect } from 'react';
import { ChefHat, Plus, Search, Clock, Users, Star, StarOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import RecipeBuilder from '@/components/food/RecipeBuilder';
import type { Recipe } from '@/lib/types/database';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  }, [searchTerm, recipes]);

  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      if (response.ok) {
        const data = await response.json();
        setRecipes(data.recipes || []);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecipe = async (recipeData: any) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeData),
      });

      if (response.ok) {
        await fetchRecipes(); // Refresh the list
      } else {
        throw new Error('Failed to save recipe');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      throw error;
    }
  };

  const handleDeleteRecipe = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;

    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRecipes(prev => prev.filter(recipe => recipe.id !== id));
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-navy" />
              My Recipes
            </h1>
            <p className="text-text-secondary text-lg">
              Create and manage your custom recipes
            </p>
          </div>
          <RecipeBuilder
            onSave={handleSaveRecipe}
            trigger={
              <Button className="bg-navy hover:bg-navy/80">
                <Plus className="h-4 w-4 mr-2" />
                Create Recipe
              </Button>
            }
          />
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your recipes..."
            className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-border rounded mb-3"></div>
                <div className="h-4 bg-border rounded mb-2"></div>
                <div className="h-4 bg-border rounded w-3/4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredRecipes.length === 0 && !searchTerm && (
          <div className="text-center py-16">
            <ChefHat className="w-24 h-24 text-text-muted mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">No recipes yet</h3>
            <p className="text-text-secondary mb-8">
              Create your first recipe to get started
            </p>
            <RecipeBuilder
              onSave={handleSaveRecipe}
              trigger={
                <Button className="bg-navy hover:bg-navy/80">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Recipe
                </Button>
              }
            />
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && filteredRecipes.length === 0 && searchTerm && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No recipes found</h3>
            <p className="text-text-secondary">
              Try a different search term or create a new recipe
            </p>
          </div>
        )}

        {/* Recipes Grid */}
        {!isLoading && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div key={recipe.id} className="bg-surface border border-border rounded-xl p-6 hover:border-navy/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-lg line-clamp-2">{recipe.name}</h3>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="text-text-muted hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {recipe.description && (
                  <p className="text-text-secondary text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-text-muted mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {(recipe.prep_time_minutes || 0) + (recipe.cook_time_minutes || 0)} min
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      // Navigate to recipe detail/edit page
                      window.location.href = `/food/recipes/${recipe.id}`;
                    }}
                  >
                    View Recipe
                  </Button>
                  <Button 
                    size="sm" 
                    className="bg-success hover:bg-success/80"
                    onClick={() => {
                      // Navigate to food add page with recipe pre-selected
                      window.location.href = `/food/add?recipe=${recipe.id}`;
                    }}
                  >
                    Log It
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && recipes.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="text-center text-text-muted">
              <p>
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
                {searchTerm && ` • ${filteredRecipes.length} shown`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}