import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase/server';

export const runtime = 'edge';

// DELETE /api/meal-templates/[id] - Delete meal template
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
      .from('meal_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting meal template:', error);
      return NextResponse.json({ error: 'Failed to delete meal template' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Meal template deleted successfully' });
  } catch (error) {
    console.error('Meal template DELETE API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}