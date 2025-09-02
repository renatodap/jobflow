import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';
import type { PersonalRecordInsert } from '@/lib/types/database';

export const runtime = 'edge';

// GET /api/personal-records - Get user's personal records
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const exerciseName = url.searchParams.get('exercise_name');
    const recordType = url.searchParams.get('record_type');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

    let query = supabase
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id)
      .order('achieved_at', { ascending: false })
      .limit(limit);

    if (exerciseName) {
      query = query.eq('exercise_name', exerciseName);
    }

    if (recordType) {
      query = query.eq('record_type', recordType);
    }

    const { data: personalRecords, error } = await query;

    if (error) {
      console.error('Error fetching personal records:', error);
      return NextResponse.json({ error: 'Failed to fetch personal records' }, { status: 500 });
    }

    return NextResponse.json({ personalRecords });
  } catch (error) {
    console.error('Personal records GET API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/personal-records - Create or update personal record
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
    if (!body.exercise_name || typeof body.exercise_name !== 'string') {
      return NextResponse.json({ error: 'Exercise name is required' }, { status: 400 });
    }

    if (!body.record_type || !['1rm', '3rm', '5rm', 'distance', 'time', 'reps'].includes(body.record_type)) {
      return NextResponse.json({ error: 'Valid record type is required' }, { status: 400 });
    }

    if (!body.value || typeof body.value !== 'number' || body.value <= 0) {
      return NextResponse.json({ error: 'Valid value is required' }, { status: 400 });
    }

    if (!body.unit || !['kg', 'lb', 'km', 'mi', 'seconds', 'minutes', 'reps'].includes(body.unit)) {
      return NextResponse.json({ error: 'Valid unit is required' }, { status: 400 });
    }

    // Check if this is a new personal record
    const { data: existingRecord } = await supabase
      .from('personal_records')
      .select('value')
      .eq('user_id', user.id)
      .eq('exercise_name', body.exercise_name.trim())
      .eq('record_type', body.record_type)
      .single();

    const isNewRecord = !existingRecord || body.value > existingRecord.value;

    if (!isNewRecord) {
      return NextResponse.json({ 
        error: 'Value does not exceed current personal record',
        currentRecord: existingRecord?.value 
      }, { status: 400 });
    }

    // Create or update personal record
    const recordData: PersonalRecordInsert = {
      user_id: user.id,
      exercise_name: body.exercise_name.trim(),
      record_type: body.record_type,
      value: body.value,
      unit: body.unit,
      workout_id: body.workout_id || null,
      achieved_at: body.achieved_at || new Date().toISOString(),
      notes: body.notes?.trim() || null,
    };

    const { data: record, error: recordError } = await supabase
      .from('personal_records')
      .upsert(recordData, {
        onConflict: 'user_id,exercise_name,record_type'
      })
      .select()
      .single();

    if (recordError) {
      console.error('Error creating/updating personal record:', recordError);
      return NextResponse.json({ error: 'Failed to save personal record' }, { status: 500 });
    }

    return NextResponse.json({ 
      record,
      isNewRecord: true,
      message: `New ${body.record_type.toUpperCase()} personal record for ${body.exercise_name}!`
    }, { status: 201 });
  } catch (error) {
    console.error('Personal records POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}