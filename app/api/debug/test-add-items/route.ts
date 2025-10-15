import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: [],
  };

  try {
    const supabase = await createClient();

    // Step 1: Create a test user
    const testUserId = crypto.randomUUID();
    const testUserEmail = `test-${Date.now()}@example.com`;
    
    results.steps.push({
      step: 1,
      action: 'Create test user',
      userId: testUserId,
      email: testUserEmail,
    });

    const { data: createdUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: testUserId,
        email: testUserEmail,
        full_name: 'Test User',
      })
      .select()
      .single();

    if (userError) {
      results.steps.push({
        step: 1,
        status: 'error',
        error: userError.message,
        code: userError.code,
        details: userError.details,
        hint: userError.hint,
      });
      return NextResponse.json(results, { status: 500 });
    }

    results.steps.push({
      step: 1,
      status: 'success',
      user: createdUser,
    });

    // Step 2: Create a grocery list
    results.steps.push({
      step: 2,
      action: 'Create grocery list',
    });

    const { data: createdList, error: listError } = await supabase
      .from('grocery_lists')
      .insert({
        user_id: testUserId,
        title: 'Test Shopping List',
        is_active: true,
        status: 'active',
      })
      .select()
      .single();

    if (listError) {
      results.steps.push({
        step: 2,
        status: 'error',
        error: listError.message,
        code: listError.code,
        details: listError.details,
        hint: listError.hint,
      });
      return NextResponse.json(results, { status: 500 });
    }

    results.steps.push({
      step: 2,
      status: 'success',
      list: createdList,
    });

    // Step 3: Add items to the list
    results.steps.push({
      step: 3,
      action: 'Add items to list',
    });

    const testItems = [
      {
        list_id: createdList.id,
        name: 'Milk',
        brand: 'Generic',
        quantity: 2,
        size: '1 gallon',
        notes: null,
        retailer: 'walmart',
        order_index: 0,
        purchased: false,
      },
      {
        list_id: createdList.id,
        name: 'Eggs',
        brand: null,
        quantity: 1,
        size: '1 dozen',
        notes: null,
        retailer: 'walmart',
        order_index: 1,
        purchased: false,
      },
    ];

    const { data: createdItems, error: itemsError } = await supabase
      .from('list_items')
      .insert(testItems)
      .select();

    if (itemsError) {
      results.steps.push({
        step: 3,
        status: 'error',
        error: itemsError.message,
        code: itemsError.code,
        details: itemsError.details,
        hint: itemsError.hint,
      });
      return NextResponse.json(results, { status: 500 });
    }

    results.steps.push({
      step: 3,
      status: 'success',
      itemCount: createdItems.length,
      items: createdItems,
    });

    // Step 4: Clean up - delete test data
    await supabase.from('grocery_lists').delete().eq('id', createdList.id);
    await supabase.from('users').delete().eq('id', testUserId);

    results.steps.push({
      step: 4,
      action: 'Cleanup',
      status: 'success',
    });

    results.summary = {
      status: 'All tests passed!',
      message: 'User creation, list creation, and item addition all work correctly.',
    };

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    results.error = {
      message: error?.message,
      stack: error?.stack,
    };
    return NextResponse.json(results, { status: 500 });
  }
}

