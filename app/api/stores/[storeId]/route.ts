import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;

  try {
    const updates = await request.json();

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating store:', error);
      return NextResponse.json(
        { error: 'Failed to update store' },
        { status: 500 }
      );
    }

    return NextResponse.json({ store: data }, { status: 200 });
  } catch (error: any) {
    console.error('Error in store PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { storeId: string } }
) {
  const { storeId } = params;

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (error) {
      console.error('Error deleting store:', error);
      return NextResponse.json(
        { error: 'Failed to delete store' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Store deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in store DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

