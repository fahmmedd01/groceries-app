import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { id, email, full_name, created_at } = await request.json();

    if (!id || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        id,
        email,
        full_name: full_name || 'User',
        created_at: created_at || new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: 'Failed to create user', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Error in create user API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

