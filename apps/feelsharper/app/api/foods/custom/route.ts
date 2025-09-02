import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { CustomFoodInsert } from '@/lib/types/database';

export const runtime = 'edge';

// GET /api/foods/custom - List user's custom foods
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search query if provided
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let query = supabase
      .from('custom_foods')
      .select('*')
      .order('name');

    // Add search filter if provided
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data: customFoods, error } = await query;

    if (error) {
      console.error('Error fetching custom foods:', error);
      return NextResponse.json({ error: 'Failed to fetch custom foods' }, { status: 500 });
    }

    return NextResponse.json({ foods: customFoods || [] });
  } catch (error) {
    console.error('Custom foods API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/foods/custom - Create new custom food
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
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Prepare food data with user ID
    const foodData: CustomFoodInsert = {
      user_id: user.id,
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
    };

    // Validate numeric fields
    const numericFields = ['serving_size', 'calories_per_serving', 'protein_g', 'carbs_g', 'fat_g', 'fiber_g', 'sugar_g', 'sodium_mg'];
    for (const field of numericFields) {
      const value = foodData[field as keyof typeof foodData];
      if (value !== null && (isNaN(value as number) || (value as number) < 0)) {
        return NextResponse.json({ error: `${field} must be a positive number` }, { status: 400 });
      }
    }

    const { data: newFood, error } = await supabase
      .from('custom_foods')
      .insert(foodData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'A food with this name already exists' }, { status: 409 });
      }
      console.error('Error creating custom food:', error);
      return NextResponse.json({ error: 'Failed to create custom food' }, { status: 500 });
    }

    return NextResponse.json({ food: newFood }, { status: 201 });
  } catch (error) {
    console.error('Custom foods POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}