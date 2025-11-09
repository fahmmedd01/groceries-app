import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const { itemId } = params;
    const body = await request.json();
    const { purchased, retailer } = body;

    if (typeof purchased !== 'boolean') {
      return NextResponse.json(
        { error: 'purchased must be a boolean' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Update the purchased status
    const updateData: any = {
      purchased,
      purchased_retailer: purchased && retailer ? retailer : null,
      purchased_at: purchased ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('list_items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating purchased status:', error);
      return NextResponse.json(
        { error: 'Failed to update purchased status' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, item: data },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in toggle-purchased API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}


