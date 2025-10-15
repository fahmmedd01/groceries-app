import { NextRequest, NextResponse } from 'next/server';
import { GroceryItem } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { items, userId, retailer, customRetailer } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    if (!retailer) {
      return NextResponse.json(
        { error: 'Retailer must be specified' },
        { status: 400 }
      );
    }

    // Use custom retailer name if retailer is "other"
    const finalRetailer = retailer === 'other' && customRetailer ? customRetailer : retailer;

    const supabase = await createClient();

    // Get or create active list for this user
    let query = supabase
      .from('grocery_lists')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    // Add user filter
    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }
    
    const { data: activeList, error: activeListError } = await query.maybeSingle();

    let listData;
    let listId;
    
    if (activeList) {
      // Use existing active list
      await supabase
        .from('grocery_lists')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('id', activeList.id);
      
      listData = activeList;
      listId = activeList.id;
    } else {
      // Create a new active grocery list
      const { data: newList, error: listError } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: userId || null,
          title: `My Shopping List`,
          is_active: true,
          status: 'active',
        })
        .select()
        .single();

      if (listError) {
        console.error('Error creating list:', listError);
        return NextResponse.json(
          { error: 'Failed to create list', details: listError.message },
          { status: 500 }
        );
      }
      
      listData = newList;
      listId = newList.id;
    }

    // Get the current max order_index to append new items
    const { data: existingItems } = await supabase
      .from('list_items')
      .select('order_index')
      .eq('list_id', listData.id)
      .order('order_index', { ascending: false })
      .limit(1);

    const startIndex = existingItems && existingItems.length > 0 
      ? existingItems[0].order_index + 1 
      : 0;

    // Insert list items
    const listItems = items.map((item: GroceryItem, index: number) => ({
      list_id: listData.id,
      name: item.name,
      brand: item.brand || null,
      quantity: item.quantity,
      size: item.size || null,
      notes: item.notes?.join(', ') || null,
      retailer: finalRetailer,
      order_index: startIndex + index,
      purchased: false,
    }));

    const { data: insertedItems, error: itemsError } = await supabase
      .from('list_items')
      .insert(listItems)
      .select();

    if (itemsError) {
      console.error('Error inserting items:', itemsError);
      return NextResponse.json(
        { error: 'Failed to add items', details: itemsError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        listId: listId,
        itemCount: insertedItems.length,
        items: insertedItems,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in add items API:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { 
        error: 'Failed to add items. Please try again.', 
        details: error?.message,
        code: error?.code,
        hint: error?.hint,
      },
      { status: 500 }
    );
  }
}

