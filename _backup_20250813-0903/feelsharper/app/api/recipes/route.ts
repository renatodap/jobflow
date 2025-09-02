import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { RecipeInsert } from '@/lib/types/database';

export const runtime = 'edge';

// GET /api/recipes - List user's recipes + public recipes
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const includePublic = url.searchParams.get('public') !== 'false';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    let query = supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          id,
          quantity,
          unit,
          notes,
          order_index,
          food_id,
          custom_food_id,
          foods (id, description),
          custom_foods (id, name)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (includePublic) {
      // Get user's own recipes OR public recipes
      query = query.or(`user_id.eq.${user.id},is_public.eq.true`);
    } else {
      // Only user's own recipes
      query = query.eq('user_id', user.id);
    }

    const { data: recipes, error } = await query;

    if (error) {
      console.error('Error fetching recipes:', error);
      return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }

    return NextResponse.json({ recipes });
  } catch (error) {
    console.error('Recipes GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/recipes - Create new recipe
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Recipe name is required' }, { status: 400 });
    }

    if (!body.ingredients || !Array.isArray(body.ingredients) || body.ingredients.length === 0) {
      return NextResponse.json({ error: 'At least one ingredient is required' }, { status: 400 });
    }

    // Validate ingredients
    for (const ingredient of body.ingredients) {
      if (!ingredient.quantity || !ingredient.unit) {
        return NextResponse.json({ error: 'All ingredients must have quantity and unit' }, { status: 400 });
      }
      
      if (!ingredient.food_id && !ingredient.custom_food_id) {
        return NextResponse.json({ error: 'Each ingredient must reference a food or custom food' }, { status: 400 });
      }
    }

    // Create recipe
    const recipeData: RecipeInsert = {
      user_id: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      servings: body.servings || 1,
      prep_time_minutes: body.prep_time_minutes || null,
      cook_time_minutes: body.cook_time_minutes || null,
      instructions: body.instructions || null,
      tags: body.tags || null,
      is_public: body.is_public || false,
    };

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert(recipeData)
      .select()
      .single();

    if (recipeError) {
      if (recipeError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'A recipe with this name already exists' }, { status: 409 });
      }
      console.error('Error creating recipe:', recipeError);
      return NextResponse.json({ error: 'Failed to create recipe' }, { status: 500 });
    }

    // Add ingredients
    const ingredientsData = body.ingredients.map((ingredient: any, index: number) => ({
      recipe_id: recipe.id,
      food_id: ingredient.food_id || null,
      custom_food_id: ingredient.custom_food_id || null,
      quantity: parseFloat(ingredient.quantity),
      unit: ingredient.unit,
      notes: ingredient.notes || null,
      order_index: index,
    }));

    const { error: ingredientsError } = await supabase
      .from('recipe_ingredients')
      .insert(ingredientsData);

    if (ingredientsError) {
      // Clean up recipe if ingredients failed
      await supabase.from('recipes').delete().eq('id', recipe.id);
      console.error('Error adding ingredients:', ingredientsError);
      return NextResponse.json({ error: 'Failed to add recipe ingredients' }, { status: 500 });
    }

    // Fetch complete recipe with ingredients
    const { data: completeRecipe, error: fetchError } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          id,
          quantity,
          unit,
          notes,
          order_index,
          food_id,
          custom_food_id,
          foods (id, description),
          custom_foods (id, name)
        )
      `)
      .eq('id', recipe.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete recipe:', fetchError);
      return NextResponse.json({ recipe }, { status: 201 }); // Return basic recipe if fetch fails
    }

    return NextResponse.json({ recipe: completeRecipe }, { status: 201 });
  } catch (error) {
    console.error('Recipes POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}