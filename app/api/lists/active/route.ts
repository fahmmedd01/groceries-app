import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    const supabase = await createClient();

    // Get active list for the user (or most recent active list for guests)
    let query = supabase
      .from('grocery_lists')
      .select(`
        *,
        items:list_items(*)
      `)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    // Add user filter
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }
    
    const { data: activeList, error } = await query.maybeSingle();

    if (error) {
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

