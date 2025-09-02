import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { BodyMeasurementInsert } from '@/lib/types/database';

export const runtime = 'edge';

// GET /api/body-measurements - Get user's body measurements
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100'), 365);

    let query = supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('measurement_date', { ascending: false })
      .limit(limit);

    if (startDate) {
      query = query.gte('measurement_date', startDate);
    }

    if (endDate) {
      query = query.lte('measurement_date', endDate);
    }

    const { data: measurements, error } = await query;

    if (error) {
      console.error('Error fetching body measurements:', error);
      return NextResponse.json({ error: 'Failed to fetch body measurements' }, { status: 500 });
    }

    return NextResponse.json({ measurements });
  } catch (error) {
    console.error('Body measurements GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/body-measurements - Add new body measurement
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
    if (!body.measurement_date) {
      return NextResponse.json({ error: 'Measurement date is required' }, { status: 400 });
    }

    // Validate at least one measurement is provided
    const hasValidMeasurement = body.weight_kg || body.body_fat_percentage || body.muscle_mass_kg ||
      body.waist_cm || body.chest_cm || body.arm_cm || body.thigh_cm || body.hip_cm || body.neck_cm;

    if (!hasValidMeasurement) {
      return NextResponse.json({ error: 'At least one measurement is required' }, { status: 400 });
    }

    // Create measurement data
    const measurementData: BodyMeasurementInsert = {
      user_id: user.id,
      measurement_date: body.measurement_date,
      weight_kg: body.weight_kg || null,
      body_fat_percentage: body.body_fat_percentage || null,
      muscle_mass_kg: body.muscle_mass_kg || null,
      visceral_fat_level: body.visceral_fat_level || null,
      water_percentage: body.water_percentage || null,
      bone_mass_kg: body.bone_mass_kg || null,
      metabolic_age: body.metabolic_age || null,
      waist_cm: body.waist_cm || null,
      chest_cm: body.chest_cm || null,
      arm_cm: body.arm_cm || null,
      thigh_cm: body.thigh_cm || null,
      hip_cm: body.hip_cm || null,
      neck_cm: body.neck_cm || null,
      progress_photo_front: body.progress_photo_front || null,
      progress_photo_side: body.progress_photo_side || null,
      progress_photo_back: body.progress_photo_back || null,
      notes: body.notes?.trim() || null,
    };

    const { data: measurement, error: measurementError } = await supabase
      .from('body_measurements')
      .upsert(measurementData, {
        onConflict: 'user_id,measurement_date'
      })
      .select()
      .single();

    if (measurementError) {
      console.error('Error creating body measurement:', measurementError);
      return NextResponse.json({ error: 'Failed to save body measurement' }, { status: 500 });
    }

    return NextResponse.json({ 
      measurement,
      message: 'Body measurement saved successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Body measurements POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}