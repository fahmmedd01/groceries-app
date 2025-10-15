import { NextRequest, NextResponse } from 'next/server';
import { GroceryItem } from '@/lib/types';
import { matchGroceryList } from '@/lib/matching/productMatcher';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { items, zipCode } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid items. Please provide at least one grocery item.' },
        { status: 400 }
      );
    }

    if (!zipCode || typeof zipCode !== 'string') {
      return NextResponse.json(
        { error: 'Invalid ZIP code. Please provide a valid ZIP code.' },
        { status: 400 }
      );
    }

    // Match products to retailer offerings
    const matchMap = matchGroceryList(items as GroceryItem[]);

    let listId = null;
    
    try {
      // Get user session (optional, allows guests)
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Create a grocery list in the database
      const { data: listData, error: listError } = await supabase
        .from('grocery_lists')
        .insert({
          user_id: user?.id || null,
          title: `Grocery List - ${new Date().toLocaleDateString()}`,
          zip_code: zipCode,
        })
        .select()
        .single();

      if (listError) {
        console.error('Error creating list:', listError);
        console.error('Supabase error details:', JSON.stringify(listError, null, 2));
        // Continue without database - return temporary ID
        listId = 'temp-' + Date.now();
      } else {
        listId = listData.id;

        // Insert list items and their retailer matches
        const listItems = items.map((item: GroceryItem, index: number) => ({
          list_id: listData.id,
          name: item.name,
          brand: item.brand || null,
          quantity: item.quantity,
          size: item.size || null,
          notes: item.notes?.join(', ') || null,
          order_index: index,
        }));

        const { data: insertedItems, error: itemsError } = await supabase
          .from('list_items')
          .insert(listItems)
          .select();

        if (!itemsError && insertedItems) {
          // Insert retailer matches for each item
          const retailerMatches: any[] = [];
          insertedItems.forEach((listItem, index) => {
            const itemName = items[index].name;
            const matches = matchMap.get(itemName) || [];
            
            matches.forEach((match) => {
              retailerMatches.push({
                list_item_id: listItem.id,
                retailer: match.retailer,
                title: match.title,
                brand: match.brand,
                size: match.size,
                price: match.price,
                stock_status: match.stockStatus,
                product_url: match.productUrl,
                image_url: match.imageUrl,
              });
            });
          });

          if (retailerMatches.length > 0) {
            await supabase
              .from('retailer_matches')
              .insert(retailerMatches);
          }
        }
      }
    } catch (dbError) {
      console.error('Database error (continuing without saving):', dbError);
      listId = 'temp-' + Date.now();
    }

    return NextResponse.json(
      {
        listId: listId,
        itemCount: items.length,
        matchCount: Array.from(matchMap.values()).flat().length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in match-products API:', error);
    console.error('Error stack:', error?.stack);
    return NextResponse.json(
      { error: 'Failed to match products. Please try again.', details: error?.message },
      { status: 500 }
    );
  }
}
