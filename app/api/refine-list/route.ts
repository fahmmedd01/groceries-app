import { NextRequest, NextResponse } from 'next/server';
import { GroceryItem } from '@/lib/types';
import { refineGroceryList } from '@/lib/anthropic/parser';

export async function POST(request: NextRequest) {
  try {
    const { items, command } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items provided.' },
        { status: 400 }
      );
    }

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { error: 'Invalid command provided.' },
        { status: 400 }
      );
    }

    // Refine the grocery list using Claude AI
    const refinedItems = await refineGroceryList(items as GroceryItem[], command);

    return NextResponse.json(
      { items: refinedItems },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in refine-list API:', error);
    return NextResponse.json(
      { error: 'Failed to refine grocery list. Please try again.' },
      { status: 500 }
    );
  }
}

