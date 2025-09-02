'use client';

import { useState, useEffect } from 'react';
import { BookTemplate, Plus, Search, Coffee, Sun, Moon, Cookie, Star, StarOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import MealTemplateCreator from '@/components/food/MealTemplateCreator';
import type { MealTemplateWithItems } from '@/lib/types/database';

const MEAL_TYPE_ICONS = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

const MEAL_TYPE_LABELS = {
  breakfast: 'Breakfast',
  lunch: 'Lunch', 
  dinner: 'Dinner',
  snack: 'Snack',
};

export default function MealTemplatesPage() {
  const [templates, setTemplates] = useState<MealTemplateWithItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<string>('all');
  const [filteredTemplates, setFilteredTemplates] = useState<MealTemplateWithItems[]>([]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;

    // Filter by meal type
    if (selectedMealType !== 'all') {
      filtered = filtered.filter(template => 
        template.meal_type === selectedMealType
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedMealType, templates]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/meal-templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData: any) => {
    try {
      const response = await fetch('/api/meal-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData),
      });

      if (response.ok) {
        await fetchTemplates(); // Refresh the list
      } else {
        throw new Error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal template?')) return;

    try {
      const response = await fetch(`/api/meal-templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(template => template.id !== id));
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleApplyTemplate = async (template: MealTemplateWithItems) => {
    const today = new Date().toISOString().split('T')[0];
    const mealType = template.meal_type || 'breakfast';

    try {
      const response = await fetch(`/api/meal-templates/${template.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: today,
          meal_type: mealType,
        }),
      });

      if (response.ok) {
        // Redirect to food page to see the logged items
        window.location.href = '/food';
      } else {
        throw new Error('Failed to apply template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template to food diary');
    }
  };

  const getTemplateItemsCount = (template: MealTemplateWithItems) => {
    return template.meal_template_items?.length || 0;
  };

  const getTemplateItemsPreview = (template: MealTemplateWithItems) => {
    const items = template.meal_template_items || [];
    if (items.length === 0) return 'No items';
    
    const preview = items.slice(0, 2).map(item => {
      return item.foods?.description || 
             item.custom_foods?.name || 
             item.recipes?.name || 
             'Unknown item';
    });
    
    if (items.length > 2) {
      preview.push(`+${items.length - 2} more`);
    }
    
    return preview.join(', ');
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
              <BookTemplate className="w-10 h-10 text-navy" />
              Meal Templates
            </h1>
            <p className="text-text-secondary text-lg">
              Save meal combinations for quick logging
            </p>
          </div>
          <MealTemplateCreator
            onSave={handleSaveTemplate}
            trigger={
              <Button className="bg-navy hover:bg-navy/80">
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            }
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>

          {/* Meal Type Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedMealType('all')}
              className={`px-4 py-3 rounded-xl border transition-colors ${
                selectedMealType === 'all'
                  ? 'bg-navy/20 border-navy text-navy'
                  : 'bg-surface border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              All
            </button>
            {Object.entries(MEAL_TYPE_ICONS).map(([type, Icon]) => (
              <button
                key={type}
                onClick={() => setSelectedMealType(type)}
                className={`px-4 py-3 rounded-xl border transition-colors flex items-center gap-2 ${
                  selectedMealType === type
                    ? 'bg-navy/20 border-navy text-navy'
                    : 'bg-surface border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{MEAL_TYPE_LABELS[type as keyof typeof MEAL_TYPE_LABELS]}</span>
              </button>
            ))}
          </div>
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
        {!isLoading && filteredTemplates.length === 0 && !searchTerm && selectedMealType === 'all' && (
          <div className="text-center py-16">
            <BookTemplate className="w-24 h-24 text-text-muted mx-auto mb-6" />
            <h3 className="text-2xl font-semibold mb-4">No meal templates yet</h3>
            <p className="text-text-secondary mb-8">
              Create templates to save time when logging recurring meals
            </p>
            <MealTemplateCreator
              onSave={handleSaveTemplate}
              trigger={
                <Button className="bg-navy hover:bg-navy/80">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              }
            />
          </div>
        )}

        {/* No Search Results */}
        {!isLoading && filteredTemplates.length === 0 && (searchTerm || selectedMealType !== 'all') && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-text-secondary">
              Try a different search term or filter, or create a new template
            </p>
          </div>
        )}

        {/* Templates Grid */}
        {!isLoading && filteredTemplates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const MealIcon = template.meal_type ? MEAL_TYPE_ICONS[template.meal_type as keyof typeof MEAL_TYPE_ICONS] : BookTemplate;
              
              return (
                <div key={template.id} className="bg-surface border border-border rounded-xl p-6 hover:border-navy/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${template.is_favorite ? 'bg-yellow-500/20' : 'bg-navy/20'}`}>
                        {template.is_favorite ? (
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        ) : (
                          <MealIcon className="w-5 h-5 text-navy" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        {template.meal_type && (
                          <p className="text-sm text-text-muted">
                            {MEAL_TYPE_LABELS[template.meal_type as keyof typeof MEAL_TYPE_LABELS]}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-text-muted hover:text-red-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-text-secondary text-sm">
                      {getTemplateItemsCount(template)} item{getTemplateItemsCount(template) !== 1 ? 's' : ''}
                    </p>
                    <p className="text-text-muted text-xs mt-1 line-clamp-2">
                      {getTemplateItemsPreview(template)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        // TODO: Open template editor/viewer
                        console.log('Edit template:', template.id);
                      }}
                    >
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-success hover:bg-success/80"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Footer */}
        {!isLoading && templates.length > 0 && (
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex justify-center gap-8 text-center text-text-muted">
              <div>
                <div className="text-2xl font-bold text-text-primary">{templates.length}</div>
                <div className="text-sm">Total Templates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {templates.filter(t => t.is_favorite).length}
                </div>
                <div className="text-sm">Favorites</div>
              </div>
              {searchTerm && (
                <div>
                  <div className="text-2xl font-bold text-text-primary">{filteredTemplates.length}</div>
                  <div className="text-sm">Shown</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}