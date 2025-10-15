import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ResultsClient } from './results-client';

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ listId: string }>;
}) {
  const { listId } = await params;
  
  // Handle temporary IDs (when database is not available)
  if (listId.startsWith('temp-')) {
    // Return a temporary list without database
    return (
      <ResultsClient
        list={{
          id: listId,
          user_id: null,
          title: 'Grocery List (Not Saved)',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          zip_code: 'N/A',
        }}
        items={[]}
      />
    );
  }
  
  const supabase = await createClient();

  // Fetch the grocery list
  const { data: list, error: listError } = await supabase
    .from('grocery_lists')
    .select('*')
    .eq('id', listId)
    .single();

  if (listError || !list) {
    notFound();
  }

  // Fetch list items with their retailer matches
  const { data: items, error: itemsError } = await supabase
    .from('list_items')
    .select(`
      *,
      retailer_matches (*)
    `)
    .eq('list_id', listId)
    .order('order_index');

  if (itemsError) {
    console.error('Error fetching items:', itemsError);
    notFound();
  }

  // Transform the data for the client component
  const transformedItems = items?.map((item: any) => ({
    id: item.id,
    list_id: item.list_id,
    name: item.name,
    brand: item.brand,
    quantity: item.quantity,
    size: item.size,
    notes: item.notes,
    order_index: item.order_index,
    purchased: item.purchased || false,
    purchased_retailer: item.purchased_retailer || null,
    purchased_at: item.purchased_at || null,
    matches: item.retailer_matches?.map((match: any) => ({
      retailer: match.retailer,
      title: match.title,
      brand: match.brand,
      size: match.size,
      price: parseFloat(match.price),
      stockStatus: match.stock_status,
      productUrl: match.product_url,
      imageUrl: match.image_url,
    })) || [],
  })) || [];

  return (
    <ResultsClient
      list={list}
      items={transformedItems}
    />
  );
}

