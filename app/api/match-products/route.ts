import { NextRequest, NextResponse } from 'next/server';
import { GroceryItem, RetailerProduct, Retailer } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Generate realistic product information for each item using AI
async function generateProductsForItem(item: GroceryItem, selectedRetailers: Retailer[]): Promise<RetailerProduct[]> {
  const retailers = selectedRetailers;
  
  try {
    const retailerNames = retailers.map(r => {
      const names: Record<string, string> = {
        walmart: 'Walmart',
        walgreens: 'Walgreens',
        marianos: "Mariano's",
        costco: 'Costco',
        samsclub: "Sam's Club"
      };
      return names[r];
    }).join(', ');

    const prompt = `Generate realistic product information for this grocery item across these retailers: ${item.name}
    
Quantity requested: ${item.quantity}
Brand preference: ${item.brand || 'any'}
Size preference: ${item.size || 'standard'}
Notes: ${item.notes?.join(', ') || 'none'}

For each of these retailers (${retailerNames}), create a realistic product listing with:
- Product title (be specific, e.g., "Great Value Large White Eggs, 12 Count")
- Brand name (use real brands or store brands)
- Size/quantity (be specific with units)
- Realistic price in USD
- Stock status (in-stock, low-stock, or out-of-stock)

Respond with ONLY valid JSON in this exact format:
{
  "products": [
    {
      "retailer": "walmart",
      "title": "Product Name with Details",
      "brand": "Brand Name",
      "size": "Size with units",
      "price": 4.99,
      "stockStatus": "in-stock"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanedText);
    
    // Map to RetailerProduct format
    return parsed.products.map((p: any, index: number) => ({
      retailer: p.retailer as Retailer,
      title: p.title,
      brand: p.brand,
      size: p.size,
      price: parseFloat(p.price),
      stockStatus: p.stockStatus,
      productUrl: `https://${p.retailer}.com/search?q=${encodeURIComponent(item.name)}`,
      imageUrl: `https://via.placeholder.com/300/E8F0D5/2D2D2D?text=${encodeURIComponent(item.name.substring(0, 20))}`,
    }));
  } catch (error) {
    console.error('Error generating products with AI:', error);
    
    // Fallback: Generate basic products if AI fails
    return retailers.map((retailer, index) => ({
      retailer,
      title: `${item.name} - ${retailer}`,
      brand: 'Generic',
      size: item.size || 'Standard',
      price: 4.99 + (index * 0.50),
      stockStatus: 'in-stock' as const,
      productUrl: `https://${retailer}.com/search?q=${encodeURIComponent(item.name)}`,
      imageUrl: `https://via.placeholder.com/300/E8F0D5/2D2D2D?text=${encodeURIComponent(item.name.substring(0, 20))}`,
    }));
  }
}

export async function POST(request: NextRequest) {
  try {
    const { items, zipCode, retailers } = await request.json();

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

    if (!retailers || !Array.isArray(retailers) || retailers.length === 0) {
      return NextResponse.json(
        { error: 'At least one retailer must be selected' },
        { status: 400 }
      );
    }

    // Generate products using AI for each item
    const allProducts = new Map<string, RetailerProduct[]>();
    
    for (const item of items as GroceryItem[]) {
      const products = await generateProductsForItem(item, retailers as Retailer[]);
      allProducts.set(item.name, products);
    }

    let listId = null;
    
    try {
      // Get user session (optional, allows guests)
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Check if there's an active list for this user/guest
      const { data: activeList, error: activListError } = await supabase
        .from('grocery_lists')
        .select('*')
        .eq('is_active', true)
        .eq('user_id', user?.id || null)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let listData;
      
      if (activeList) {
        // Use existing active list and update its timestamp
        await supabase
          .from('grocery_lists')
          .update({ 
            updated_at: new Date().toISOString(),
            zip_code: zipCode // Update ZIP code if changed
          })
          .eq('id', activeList.id);
        
        listData = activeList;
        listId = activeList.id;
      } else {
        // Create a new active grocery list
        const { data: newList, error: listError } = await supabase
          .from('grocery_lists')
          .insert({
            user_id: user?.id || null,
            title: `My Shopping List`,
            zip_code: zipCode,
            is_active: true,
            status: 'active',
          })
          .select()
          .single();

        if (listError) {
          console.error('Error creating list:', listError);
          console.error('Supabase error details:', JSON.stringify(listError, null, 2));
          // Continue without database - return temporary ID
          listId = 'temp-' + Date.now();
        } else {
          listData = newList;
          listId = newList.id;
        }
      }

      if (listData && listId && !listId.startsWith('temp-')) {
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

        // Insert list items and their retailer matches
        const listItems = items.map((item: GroceryItem, index: number) => ({
          list_id: listData.id,
          name: item.name,
          brand: item.brand || null,
          quantity: item.quantity,
          size: item.size || null,
          notes: item.notes?.join(', ') || null,
          order_index: startIndex + index,
          purchased: false, // New items are not purchased
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
            const matches = allProducts.get(itemName) || [];
            
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
        matchCount: Array.from(allProducts.values()).flat().length,
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
