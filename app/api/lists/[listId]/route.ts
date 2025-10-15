import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  const { listId } = params;

  try {
    const updates = await request.json();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('grocery_lists')
      .update(updates)
      .eq('id', listId)
      .select()
      .single();

    if (error) {
      console.error('Error updating list:', error);
      return NextResponse.json(
        { error: 'Failed to update list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ list: data }, { status: 200 });
  } catch (error: any) {
    console.error('Error in list PATCH API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { listId: string } }
) {
  const { listId } = params;

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('grocery_lists')
      .delete()
      .eq('id', listId);

    if (error) {
      console.error('Error deleting list:', error);
      return NextResponse.json(
        { error: 'Failed to delete list' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'List deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in list DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

