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
    
    // Verify Supabase connection
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('❌ Supabase environment variables not configured');
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    console.log('Creating user:', { id, email, full_name });

    let newUser, error;
    try {
      const result = await supabase
        .from('users')
        .insert({
          id,
          email,
          full_name: full_name || 'User',
          created_at: created_at || new Date().toISOString(),
        })
        .select()
        .single();
      newUser = result.data;
      error = result.error;
    } catch (fetchError: any) {
      console.error('❌ Network error creating user:', fetchError);
      return NextResponse.json(
        { error: 'Database connection failed', details: fetchError.message },
        { status: 500 }
      );
    }

    if (error) {
      console.error('❌ Error creating user:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      return NextResponse.json(
        { error: 'Failed to create user', details: error.message, code: error.code },
        { status: 500 }
      );
    }
    
    console.log('✅ User created successfully:', newUser.id);

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error: any) {
    console.error('Error in create user API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}



