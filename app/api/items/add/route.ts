import { NextRequest, NextResponse } from 'next/server';
import { GroceryItem } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { normalizeRetailerName, isKnownRetailer } from '@/lib/utils/retailer-normalizer';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { items, userId, userEmail, userName, retailer, customRetailer } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Check if retailer is needed (when items don't have their own retailers)
    const itemsWithoutRetailer = items.filter((item: GroceryItem) => !item.retailer);
    if (itemsWithoutRetailer.length > 0 && !retailer) {
      return NextResponse.json(
        { error: 'Retailer must be specified for items without inline retailer assignments' },
        { status: 400 }
      );
    }

    // Use custom retailer name if retailer is "other"
    const finalRetailer = retailer === 'other' && customRetailer ? customRetailer : retailer;

    const supabase = await createClient();

    // If userId is provided, ensure user exists in database
    if (userId) {
      console.log('Checking if user exists:', userId);
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking user existence:', checkError);
      }

      if (!existingUser) {
        console.log('User does not exist, creating user:', { userId, userEmail, userName });
        // Create user in database (they signed in via localStorage)
        const { data: newUser, error: userError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: userEmail || `user-${userId}@local`,
            full_name: userName || 'User',
          })
          .select()
          .single();

        if (userError) {
          console.error('❌ ERROR: Failed to create user:', userError);
          console.error('User creation error details:', {
            message: userError?.message,
            code: userError?.code,
            details: userError?.details,
            hint: userError?.hint,
          });
          
          // If user creation fails, we CANNOT proceed with this userId
          // Return error to client
          return NextResponse.json(
            { 
              error: 'Failed to initialize user. Please try signing in again.', 
              details: userError.message,
              code: userError.code,
            },
            { status: 500 }
          );
        }
        
        console.log('✅ User created successfully:', newUser);
      } else {
        console.log('✅ User already exists:', existingUser.id);
      }
    } else {
      console.log('ℹ️ No userId provided, creating guest list');
    }

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
      console.log('✅ Found existing active list:', activeList.id);
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
      console.log('Creating new list for user:', userId || 'guest');
      const listToInsert = {
        user_id: userId || null,
        title: `My Shopping List`,
        is_active: true,
        status: 'active',
      };
      console.log('List data to insert:', listToInsert);
      
      const { data: newList, error: listError } = await supabase
        .from('grocery_lists')
        .insert(listToInsert)
        .select()
        .single();

      if (listError) {
        console.error('❌ ERROR: Failed to create list');
        console.error('List creation error:', listError);
        console.error('Error details:', {
          message: listError?.message,
          code: listError?.code,
          details: listError?.details,
          hint: listError?.hint,
        });
        return NextResponse.json(
          { 
            error: 'Failed to create list', 
            details: listError.message,
            code: listError.code,
            hint: listError.hint,
          },
          { status: 500 }
        );
      }
      
      console.log('✅ List created successfully:', newList.id);
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
    const listItems = items.map((item: GroceryItem, index: number) => {
      // Normalize the retailer name from AI (handles "whole foods" -> "wholefoods", etc.)
      const normalizedItemRetailer = item.retailer ? normalizeRetailerName(item.retailer) : null;
      
      // Log for debugging
      if (item.retailer) {
        console.log(`Item "${item.name}": AI extracted retailer="${item.retailer}", normalized to="${normalizedItemRetailer}"`);
      }
      
      // Determine final retailer for this item:
      // 1. Use normalized retailer if it's a known retailer
      // 2. Use original AI retailer if it's not known (could be custom)
      // 3. Fallback to dropdown selection
      let itemRetailer: string;
      if (normalizedItemRetailer && isKnownRetailer(normalizedItemRetailer)) {
        itemRetailer = normalizedItemRetailer;
      } else if (item.retailer) {
        itemRetailer = item.retailer; // Keep original for custom retailers
      } else if (finalRetailer) {
        itemRetailer = finalRetailer; // Use dropdown selection
      } else {
        // This shouldn't happen due to validation above, but handle it gracefully
        itemRetailer = 'other';
        console.warn(`No retailer found for item "${item.name}", defaulting to "other"`);
      }
      
      console.log(`Final retailer for "${item.name}": "${itemRetailer}"`);
      
      return {
        list_id: listData.id,
        name: item.name,
        brand: item.brand || null,
        quantity: item.quantity,
        size: item.size || null,
        notes: item.notes?.join(', ') || null,
        retailer: itemRetailer, // Per-item retailer assignment with fallback
        order_index: startIndex + index,
        purchased: false,
      };
    });

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

