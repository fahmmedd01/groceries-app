import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { listId, title } = await request.json();

    if (!listId) {
      return NextResponse.json(
        { error: 'List ID is required.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to save lists.' },
        { status: 401 }
      );
    }

    // Update the list to associate it with the user
    const { data, error } = await supabase
      .from('grocery_lists')
      .update({
        user_id: user.id,
        title: title || `Grocery List - ${new Date().toLocaleDateString()}`,
      })
      .eq('id', listId)
      .select()
      .single();

    if (error) {
      console.error('Error saving list:', error);
      return NextResponse.json(
        { error: 'Failed to save list.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, list: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in save list API:', error);
    return NextResponse.json(
      { error: 'Failed to save list. Please try again.' },
      { status: 500 }
    );
  }
}

