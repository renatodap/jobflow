import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');

    let queryBuilder = supabase
      .from('foods')
      .select('*')
      .limit(limit);

    if (query) {
      queryBuilder = queryBuilder.or(`name.ilike.%${query}%,brand.ilike.%${query}%`);
    }

    // Get public foods and user's custom foods
    queryBuilder = queryBuilder.or(`owner_user_id.is.null,owner_user_id.eq.${user.id}`);

    const { data: foods, error } = await queryBuilder.order('verified_source', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ foods });
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
    const { name, brand, unit, kcal, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg } = body;

    const { data: food, error } = await supabase
      .from('foods')
      .insert({
        owner_user_id: user.id,
        name,
        brand,
        unit: unit || 'g',
        kcal: kcal || 0,
        protein_g: protein_g || 0,
        carbs_g: carbs_g || 0,
        fat_g: fat_g || 0,
        fiber_g: fiber_g || 0,
        sugar_g: sugar_g || 0,
        sodium_mg: sodium_mg || 0,
        verified_source: false
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ food });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
