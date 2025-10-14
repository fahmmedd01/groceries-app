import { NextRequest, NextResponse } from 'next/server';
import { parseGroceryInput } from '@/lib/anthropic/parser';

export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input || typeof input !== 'string' || input.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid input. Please provide grocery items as text.' },
        { status: 400 }
      );
    }

    // Parse the grocery input using Claude AI
    const parsedList = await parseGroceryInput(input);

    return NextResponse.json(parsedList, { status: 200 });
  } catch (error) {
    console.error('Error in parse-grocery-input API:', error);
    return NextResponse.json(
      { error: 'Failed to parse grocery input. Please try again.' },
      { status: 500 }
    );
  }
}

