import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get active list for the user (or most recent active list for guests)
    const { data: activeList, error } = await supabase
      .from('grocery_lists')
      .select(`
        *,
        items:list_items(
          *,
          matches:retailer_matches(*)
        )
      `)
      .eq('is_active', true)
      .eq('user_id', user?.id || null)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is okay
      console.error('Error fetching active list:', error);
      return NextResponse.json(
        { error: 'Failed to fetch active list' },
        { status: 500 }
      );
    }

    // If no active list found, return null
    if (!activeList) {
      return NextResponse.json(
        { list: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { list: activeList },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in active list API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

