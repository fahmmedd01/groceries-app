import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stores:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stores' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stores }, { status: 200 });
  } catch (error: any) {
    console.error('Error in stores GET API:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error?.message,
        code: error?.code,
        hint: error?.hint,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, userEmail, userName, name, retailer, address } = await request.json();

    if (!userId || !name || !retailer) {
      return NextResponse.json(
        { error: 'userId, name, and retailer are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Ensure user exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingUser) {
      // Create user in database
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: userEmail || `user-${userId}@local`,
          full_name: userName || 'User',
        });

      if (userError) {
        console.error('Error creating user:', userError);
      }
    }

    const { data: newStore, error } = await supabase
      .from('stores')
      .insert({
        user_id: userId,
        name,
        retailer,
        address: address || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating store:', error);
      return NextResponse.json(
        { error: 'Failed to create store' },
        { status: 500 }
      );
    }

    return NextResponse.json({ store: newStore }, { status: 201 });
  } catch (error: any) {
    console.error('Error in stores POST API:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error?.message,
        code: error?.code,
        hint: error?.hint,
      },
      { status: 500 }
    );
  }
}

