import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const supabase = await createClient();

    let query = supabase
      .from('grocery_lists')
      .select(`
        *,
        items:list_items(*)
      `)
      .order('updated_at', { ascending: false });

    // Filter by user
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    // Filter by status
    if (status === 'active') {
      query = query.eq('is_active', true);
    }

    const { data: lists, error } = await query;

    if (error) {
      console.error('Error fetching lists:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lists' },
        { status: 500 }
      );
    }

    return NextResponse.json({ lists }, { status: 200 });
  } catch (error: any) {
    console.error('Error in lists GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: newList, error } = await supabase
      .from('grocery_lists')
      .insert({
        user_id: userId || null,
        title,
        is_active: true,
        status: 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating list:', error);
      return NextResponse.json(
        { error: 'Failed to create list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ list: newList }, { status: 201 });
  } catch (error: any) {
    console.error('Error in lists POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

