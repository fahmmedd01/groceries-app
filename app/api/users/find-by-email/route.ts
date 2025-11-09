import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    let user, error;
    try {
      const result = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      user = result.data;
      error = result.error;
    } catch (fetchError: any) {
      console.error('❌ Network error finding user:', fetchError);
      return NextResponse.json(
        { error: 'Database connection failed', details: fetchError.message },
        { status: 500 }
      );
    }

    if (error) {
      console.error('❌ Error finding user:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      return NextResponse.json(
        { error: 'Failed to find user', details: error.message },
        { status: 500 }
      );
    }
    
    console.log('✅ User lookup result:', user ? 'Found' : 'Not found');

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error('Error in find-by-email API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}



