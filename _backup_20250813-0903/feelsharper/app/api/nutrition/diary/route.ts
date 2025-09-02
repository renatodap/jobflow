import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

interface DiaryEntry {
  id: string;
  meal_type: string;
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { data: entries, error } = await supabase
      .from('food_diary')
      .select(`
        *,
        foods (
          id, name, brand, unit, kcal, protein_g, carbs_g, fat_g
        )
      `)
      .eq('user_id', user.id)
      .eq('date', date)
      .order('logged_at', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by meal type
    const groupedEntries = entries?.reduce((acc: Record<string, DiaryEntry[]>, entry: DiaryEntry) => {
      if (!acc[entry.meal_type]) {
        acc[entry.meal_type] = [];
      }
      acc[entry.meal_type].push(entry);
      return acc;
    }, {} as Record<string, DiaryEntry[]>) || {};

    return NextResponse.json({ entries: groupedEntries, date });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, meal_type, food_id, meal_id, quantity, notes } = body;

    // Calculate nutrients snapshot
    let nutrients_snapshot = {};
    
    if (food_id) {
      const { data: food } = await supabase
        .from('foods')
        .select('kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg')
        .eq('id', food_id)
        .single();
      
      if (food) {
        nutrients_snapshot = {
          kcal: (food.kcal * quantity).toFixed(1),
          protein_g: (food.protein_g * quantity).toFixed(1),
          carbs_g: (food.carbs_g * quantity).toFixed(1),
          fat_g: (food.fat_g * quantity).toFixed(1),
          fiber_g: (food.fiber_g * quantity).toFixed(1),
          sugar_g: (food.sugar_g * quantity).toFixed(1),
          sodium_mg: (food.sodium_mg * quantity).toFixed(1)
        };
      }
    }

    const { data: entry, error } = await supabase
      .from('food_diary')
      .insert({
        user_id: user.id,
        date,
        meal_type,
        food_id,
        meal_id,
        quantity,
        notes,
        nutrients_snapshot
      })
      .select(`
        *,
        foods (
          id, name, brand, unit, kcal, protein_g, carbs_g, fat_g
        )
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ entry });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');

    if (!entryId) {
      return NextResponse.json({ error: 'Entry ID required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('food_diary')
      .delete()
      .eq('id', entryId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
