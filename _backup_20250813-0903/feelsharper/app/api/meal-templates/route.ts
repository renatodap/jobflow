import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { MealTemplateInsert } from '@/lib/types/database';

export const runtime = 'edge';

// GET /api/meal-templates - List user's meal templates
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const mealType = url.searchParams.get('meal_type');
    const favoritesOnly = url.searchParams.get('favorites') === 'true';
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

    let query = supabase
      .from('meal_templates')
      .select(`
        *,
        meal_template_items (
          id,
          quantity,
          unit,
          food_id,
          custom_food_id,
          recipe_id,
          foods (id, description, calories_per_100g, protein_g, carbs_g, fat_g),
          custom_foods (id, name, calories_per_serving, protein_g, carbs_g, fat_g),
          recipes (id, name, servings)
        )
      `)
      .eq('user_id', user.id)
      .order('is_favorite', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (mealType) {
      query = query.eq('meal_type', mealType);
    }

    if (favoritesOnly) {
      query = query.eq('is_favorite', true);
    }

    const { data: templates, error } = await query;

    if (error) {
      console.error('Error fetching meal templates:', error);
      return NextResponse.json({ error: 'Failed to fetch meal templates' }, { status: 500 });
    }

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Meal templates GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/meal-templates - Create new meal template
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
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'At least one item is required' }, { status: 400 });
    }

    // Validate items
    for (const item of body.items) {
      if (!item.quantity || !item.unit) {
        return NextResponse.json({ error: 'All items must have quantity and unit' }, { status: 400 });
      }
      
      if (!item.food_id && !item.custom_food_id && !item.recipe_id) {
        return NextResponse.json({ error: 'Each item must reference a food, custom food, or recipe' }, { status: 400 });
      }
    }

    // Create template
    const templateData: MealTemplateInsert = {
      user_id: user.id,
      name: body.name.trim(),
      meal_type: body.meal_type || null,
      is_favorite: body.is_favorite || false,
    };

    const { data: template, error: templateError } = await supabase
      .from('meal_templates')
      .insert(templateData)
      .select()
      .single();

    if (templateError) {
      if (templateError.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'A template with this name already exists' }, { status: 409 });
      }
      console.error('Error creating template:', templateError);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    // Add items
    const itemsData = body.items.map((item: any) => ({
      template_id: template.id,
      food_id: item.food_id || null,
      custom_food_id: item.custom_food_id || null,
      recipe_id: item.recipe_id || null,
      quantity: parseFloat(item.quantity),
      unit: item.unit,
    }));

    const { error: itemsError } = await supabase
      .from('meal_template_items')
      .insert(itemsData);

    if (itemsError) {
      // Clean up template if items failed
      await supabase.from('meal_templates').delete().eq('id', template.id);
      console.error('Error adding template items:', itemsError);
      return NextResponse.json({ error: 'Failed to add template items' }, { status: 500 });
    }

    // Fetch complete template with items
    const { data: completeTemplate, error: fetchError } = await supabase
      .from('meal_templates')
      .select(`
        *,
        meal_template_items (
          id,
          quantity,
          unit,
          food_id,
          custom_food_id,
          recipe_id,
          foods (id, description),
          custom_foods (id, name),
          recipes (id, name)
        )
      `)
      .eq('id', template.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete template:', fetchError);
      return NextResponse.json({ template }, { status: 201 });
    }

    return NextResponse.json({ template: completeTemplate }, { status: 201 });
  } catch (error) {
    console.error('Meal templates POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}