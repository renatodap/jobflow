# Feature Plan: Custom Food Creation

## Scope
Enhanced food logging with ability to create, edit, and save custom food entries.

## Current Status Analysis
- ✅ USDA database search working (`app/food/` pages)
- ✅ Food diary entries (`nutrition_logs` table) 
- ✅ Macro tracking (calories, protein, carbs, fat)
- ❌ No custom food creation capability

## Implementation Plan

### Database Changes
- Add `custom_foods` table with user-specific entries
- Migration: `0003_custom_foods.sql`
- RLS policies for user isolation

### API Changes
- `POST /api/foods/custom` - Create custom food
- `PUT /api/foods/custom/[id]` - Update custom food
- `GET /api/foods/custom` - List user's custom foods

### UI Changes
- Add "Create Custom Food" button in food search
- Custom food creation form modal
- Edit capability for existing custom foods
- Visual distinction between USDA and custom foods

### Features
1. Manual nutrition entry form
2. Save as personal recipe
3. Copy from existing food + modify
4. Delete custom foods
5. Quick-add from favorites

## Database Schema

```sql
CREATE TABLE custom_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size DECIMAL,
  serving_unit TEXT,
  calories_per_serving DECIMAL,
  protein_g DECIMAL,
  carbs_g DECIMAL, 
  fat_g DECIMAL,
  fiber_g DECIMAL,
  sugar_g DECIMAL,
  sodium_mg DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Test Plan
- Unit tests for custom food CRUD operations
- E2E test for create → save → search → use flow
- RLS policy tests (users can only see their foods)

## Acceptance Criteria
- [ ] User can create custom food with nutrition data
- [ ] Custom foods appear in search results
- [ ] Custom foods can be edited/deleted
- [ ] Custom foods integrate with meal logging
- [ ] Proper data validation and error handling

## Risk Mitigation
- Start with basic form, add advanced features later
- Validate nutrition data ranges
- Prevent duplicate names per user

---
**Estimated Time:** 2 hours
**Files to Create/Modify:**
- `supabase/migrations/0003_custom_foods.sql`
- `app/api/foods/custom/route.ts` 
- `components/food/CustomFoodModal.tsx`
- `app/food/add/page.tsx` (enhance)