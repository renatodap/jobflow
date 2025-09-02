import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// POST /api/meal-templates/[id]/apply - Apply template to food diary
export async function POST(
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
    if (!body.date || !body.meal_type) {
      return NextResponse.json({ error: 'Date and meal_type are required' }, { status: 400 });
    }

    // Fetch template with items
    const { data: template, error: templateError } = await supabase
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
      .eq('id', id)
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error('Error fetching template:', templateError);
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }

    // Convert template items to nutrition log entries
    const nutritionEntries = [];
    
    for (const item of template.meal_template_items) {
      let calories = 0;
      let protein_g = 0;
      let carbs_g = 0;
      let fat_g = 0;

      // Calculate nutrition based on item type
      if (item.food_id && item.foods) {
        const food = item.foods;
        const factor = item.quantity / 100; // USDA foods are per 100g
        calories = (food.calories_per_100g || 0) * factor;
        protein_g = (food.protein_g || 0) * factor;
        carbs_g = (food.carbs_g || 0) * factor;
        fat_g = (food.fat_g || 0) * factor;
      } else if (item.custom_food_id && item.custom_foods) {
        const food = item.custom_foods;
        const servings = item.quantity; // Assume custom foods quantity is in servings
        calories = (food.calories_per_serving || 0) * servings;
        protein_g = (food.protein_g || 0) * servings;
        carbs_g = (food.carbs_g || 0) * servings;
        fat_g = (food.fat_g || 0) * servings;
      } else if (item.recipe_id && item.recipes) {
        // For recipes, we'd need to calculate nutrition from ingredients
        // For now, set to 0 and let the user see the recipe separately
        calories = 0;
        protein_g = 0;
        carbs_g = 0;
        fat_g = 0;
      }

      nutritionEntries.push({
        user_id: user.id,
        date: body.date,
        meal_type: body.meal_type,
        food_id: item.food_id,
        quantity_g: item.quantity,
        calories: Math.round(calories),
        protein_g: Math.round(protein_g * 10) / 10,
        carbs_g: Math.round(carbs_g * 10) / 10,
        fat_g: Math.round(fat_g * 10) / 10,
        notes: `From template: ${template.name}`,
      });
    }

    // Insert nutrition log entries
    const { data: logEntries, error: logError } = await supabase
      .from('nutrition_logs')
      .insert(nutritionEntries)
      .select();

    if (logError) {
      console.error('Error creating nutrition log entries:', logError);
      return NextResponse.json({ error: 'Failed to apply template to diary' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Template applied successfully',
      entries: logEntries 
    });
  } catch (error) {
    console.error('Template apply API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}