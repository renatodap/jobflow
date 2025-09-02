import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { RecipeUpdate } from '@/lib/types/database';

export const runtime = 'edge';

// GET /api/recipes/[id] - Get specific recipe
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { data: recipe, error } = await supabase
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
          foods (id, description, calories_per_100g, protein_g, carbs_g, fat_g),
          custom_foods (id, name, calories_per_serving, protein_g, carbs_g, fat_g)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows found
        return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
      }
      console.error('Error fetching recipe:', error);
      return NextResponse.json({ error: 'Failed to fetch recipe' }, { status: 500 });
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Recipe GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/recipes/[id] - Update recipe
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Validate required fields
    if (body.name && typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Recipe name must be a string' }, { status: 400 });
    }

    // Prepare update data
    const updateData: RecipeUpdate = {
      name: body.name?.trim(),
      description: body.description?.trim() || null,
      servings: body.servings || undefined,
      prep_time_minutes: body.prep_time_minutes || null,
      cook_time_minutes: body.cook_time_minutes || null,
      instructions: body.instructions || null,
      tags: body.tags || null,
      is_public: body.is_public ?? undefined,
      updated_at: new Date().toISOString(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const { data: updatedRecipe, error } = await supabase
      .from('recipes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows updated
        return NextResponse.json({ error: 'Recipe not found or unauthorized' }, { status: 404 });
      }
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'A recipe with this name already exists' }, { status: 409 });
      }
      console.error('Error updating recipe:', error);
      return NextResponse.json({ error: 'Failed to update recipe' }, { status: 500 });
    }

    // Update ingredients if provided
    if (body.ingredients && Array.isArray(body.ingredients)) {
      // Delete existing ingredients
      await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('recipe_id', id);

      // Add new ingredients
      const ingredientsData = body.ingredients.map((ingredient: any, index: number) => ({
        recipe_id: id,
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
        console.error('Error updating ingredients:', ingredientsError);
        return NextResponse.json({ error: 'Failed to update recipe ingredients' }, { status: 500 });
      }
    }

    // Fetch complete updated recipe
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
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated recipe:', fetchError);
      return NextResponse.json({ recipe: updatedRecipe });
    }

    return NextResponse.json({ recipe: completeRecipe });
  } catch (error) {
    console.error('Recipe PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/recipes/[id] - Delete recipe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting recipe:', error);
      return NextResponse.json({ error: 'Failed to delete recipe' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Recipe DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}