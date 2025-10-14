import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listId: string }> }
) {
  try {
    const { listId } = await params;
    const supabase = await createClient();

    // Fetch the list with items and matches
    const { data: list, error: listError } = await supabase
      .from('grocery_lists')
      .select('*')
      .eq('id', listId)
      .single();

    if (listError || !list) {
      return NextResponse.json(
        { error: 'List not found.' },
        { status: 404 }
      );
    }

    const { data: items, error: itemsError } = await supabase
      .from('list_items')
      .select(`
        *,
        retailer_matches (*)
      `)
      .eq('list_id', listId)
      .order('order_index');

    if (itemsError) {
      return NextResponse.json(
        { error: 'Failed to fetch list items.' },
        { status: 500 }
      );
    }

    // Generate CSV
    const csvRows = [
      ['Item', 'Brand', 'Quantity', 'Size', 'Best Price', 'Retailer', 'Stock Status'],
    ];

    items?.forEach((item: any) => {
      const matches = item.retailer_matches || [];
      if (matches.length > 0) {
        // Find best price
        const bestMatch = matches.reduce((best: any, current: any) => {
          return parseFloat(current.price) < parseFloat(best.price) ? current : best;
        });

        csvRows.push([
          item.name,
          item.brand || '',
          item.quantity.toString(),
          item.size || '',
          `$${parseFloat(bestMatch.price).toFixed(2)}`,
          bestMatch.retailer,
          bestMatch.stock_status,
        ]);
      } else {
        csvRows.push([
          item.name,
          item.brand || '',
          item.quantity.toString(),
          item.size || '',
          'N/A',
          'N/A',
          'N/A',
        ]);
      }
    });

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="grocery-list-${listId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error in export list API:', error);
    return NextResponse.json(
      { error: 'Failed to export list. Please try again.' },
      { status: 500 }
    );
  }
}

