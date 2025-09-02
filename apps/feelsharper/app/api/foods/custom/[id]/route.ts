import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { CustomFoodUpdate } from '@/lib/types/database';

export const runtime = 'edge';

// PUT /api/foods/custom/[id] - Update custom food
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
    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Prepare update data
    const updateData: CustomFoodUpdate = {
      name: body.name.trim(),
      brand: body.brand?.trim() || null,
      serving_size: body.serving_size ? parseFloat(body.serving_size) : null,
      serving_unit: body.serving_unit || 'g',
      calories_per_serving: body.calories_per_serving ? parseFloat(body.calories_per_serving) : null,
      protein_g: body.protein_g ? parseFloat(body.protein_g) : null,
      carbs_g: body.carbs_g ? parseFloat(body.carbs_g) : null,
      fat_g: body.fat_g ? parseFloat(body.fat_g) : null,
      fiber_g: body.fiber_g ? parseFloat(body.fiber_g) : null,
      sugar_g: body.sugar_g ? parseFloat(body.sugar_g) : null,
      sodium_mg: body.sodium_mg ? parseFloat(body.sodium_mg) : null,
      is_recipe: body.is_recipe || false,
      notes: body.notes?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    // Validate numeric fields
    const numericFields = ['serving_size', 'calories_per_serving', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sugar_g', 'sodium_mg'];
    for (const field of numericFields) {
      const value = updateData[field as keyof typeof updateData];
      if (value !== null && (isNaN(value as number) || (value as number) < 0)) {
        return NextResponse.json({ error: `${field} must be a positive number` }, { status: 400 });
      }
    }

    const { data: updatedFood, error } = await supabase
      .from('custom_foods')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows updated
        return NextResponse.json({ error: 'Custom food not found or unauthorized' }, { status: 404 });
      }
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'A food with this name already exists' }, { status: 409 });
      }
      console.error('Error updating custom food:', error);
      return NextResponse.json({ error: 'Failed to update custom food' }, { status: 500 });
    }

    return NextResponse.json({ food: updatedFood });
  } catch (error) {
    console.error('Custom food PUT API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/foods/custom/[id] - Delete custom food
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
      .from('custom_foods')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting custom food:', error);
      return NextResponse.json({ error: 'Failed to delete custom food' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Custom food deleted successfully' });
  } catch (error) {
    console.error('Custom food DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}