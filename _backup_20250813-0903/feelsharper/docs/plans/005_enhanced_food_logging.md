# Enhanced Food Logging Implementation

## Overview
Expand food logging with custom recipes, meal templates, barcode scanning foundation, and enhanced macro/micronutrient tracking.

## Scope
From FEATURES.md: "Search + barcode + photo-to-food (with editable suggestions), custom recipes, saved meals, portion helper"

## Current State Analysis
- ✅ USDA food database (8000+ foods)
- ✅ Custom foods creation system
- ✅ Basic food diary logging
- ❌ Recipe builder missing
- ❌ Meal templates missing  
- ❌ Barcode scanning missing
- ❌ Enhanced portion helpers missing

## Implementation Plan

### 1. Database Schema Extensions
```sql
-- Recipe system
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  servings INTEGER DEFAULT 1,
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  instructions TEXT[],
  tags TEXT[],
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe ingredients (links to foods/custom_foods)
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES foods(id),
  custom_food_id UUID REFERENCES custom_foods(id),
  quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  order_index INTEGER DEFAULT 0
);

-- Meal templates (frequently eaten combinations)
CREATE TABLE meal_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT, -- breakfast, lunch, dinner, snack
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Template items
CREATE TABLE meal_template_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
  food_id INTEGER REFERENCES foods(id),
  custom_food_id UUID REFERENCES custom_foods(id),
  recipe_id UUID REFERENCES recipes(id),
  quantity DECIMAL(10,3) NOT NULL,
  unit TEXT NOT NULL
);
```

### 2. API Endpoints
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes` - List user recipes
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe
- `POST /api/recipes/[id]/clone` - Clone public recipe
- `POST /api/meal-templates` - Create meal template
- `GET /api/meal-templates` - List templates
- `POST /api/meal-templates/[id]/apply` - Add template to diary

### 3. UI Components
- `RecipeBuilder` - Step-by-step recipe creation
- `MealTemplateCreator` - Save frequent meals
- `PortionHelper` - Visual portion guides
- `BarcodeScanner` - Camera integration (foundation)
- `RecipeCard` - Display recipe with nutrition
- `QuickAddMeal` - Template selection

### 4. Enhanced Features
- **Nutrition calculations** - Automatic per-serving macros
- **Portion helpers** - Visual guides (palm, fist, thumb)
- **Quick actions** - "Log this again", "Save as template"
- **Smart suggestions** - Based on time of day, history
- **Barcode foundation** - UI ready for future API integration

## Acceptance Criteria
- [ ] Users can create multi-ingredient recipes
- [ ] Nutrition automatically calculated per serving
- [ ] Meal templates can be saved and reused
- [ ] Visual portion helpers available
- [ ] Quick-add functionality for common meals
- [ ] All data isolated per user (RLS tested)
- [ ] Mobile-optimized recipe creation flow

## Test Plan
1. **Unit tests** - Recipe calculation logic
2. **Integration tests** - API endpoints + RLS
3. **E2E tests** - Recipe creation → save → log meal flow
4. **Visual tests** - Recipe cards, portion helpers

## Rollback Plan
- Database migration can be reverted
- Feature can be hidden with environment flag
- Existing food logging unaffected

## Risk Assessment
- **Medium complexity** - Multiple new tables and relationships
- **Low risk** - Additive feature, doesn't affect existing functionality
- **High value** - Significantly improves user experience

## Timeline Estimate
- Database + API: 45 minutes
- UI components: 90 minutes  
- Testing + polish: 30 minutes
- **Total: 2.75 hours**