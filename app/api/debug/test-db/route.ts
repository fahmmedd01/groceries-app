import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    tests: {},
  };

  try {
    const supabase = await createClient();

    // Test 1: Check if we can connect
    results.tests.connection = 'Connected to Supabase';

    // Test 2: Check if users table exists and we can read
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email')
        .limit(1);
      
      if (usersError) {
        results.tests.users_table = {
          status: 'error',
          error: usersError.message,
          code: usersError.code,
          details: usersError.details,
          hint: usersError.hint,
        };
      } else {
        results.tests.users_table = {
          status: 'ok',
          count: users?.length || 0,
        };
      }
    } catch (e: any) {
      results.tests.users_table = { status: 'exception', error: e.message };
    }

    // Test 3: Check if grocery_lists table exists with new columns
    try {
      const { data: lists, error: listsError } = await supabase
        .from('grocery_lists')
        .select('id, is_active, status')
        .limit(1);
      
      if (listsError) {
        results.tests.grocery_lists = {
          status: 'error',
          error: listsError.message,
          code: listsError.code,
          details: listsError.details,
          hint: listsError.hint,
        };
      } else {
        results.tests.grocery_lists = {
          status: 'ok',
          count: lists?.length || 0,
          has_is_active: lists?.[0]?.hasOwnProperty('is_active'),
          has_status: lists?.[0]?.hasOwnProperty('status'),
        };
      }
    } catch (e: any) {
      results.tests.grocery_lists = { status: 'exception', error: e.message };
    }

    // Test 4: Check if list_items table has retailer column
    try {
      const { data: items, error: itemsError } = await supabase
        .from('list_items')
        .select('id, retailer, purchased')
        .limit(1);
      
      if (itemsError) {
        results.tests.list_items = {
          status: 'error',
          error: itemsError.message,
          code: itemsError.code,
          details: itemsError.details,
          hint: itemsError.hint,
        };
      } else {
        results.tests.list_items = {
          status: 'ok',
          count: items?.length || 0,
          has_retailer: items?.[0]?.hasOwnProperty('retailer'),
          has_purchased: items?.[0]?.hasOwnProperty('purchased'),
        };
      }
    } catch (e: any) {
      results.tests.list_items = { status: 'exception', error: e.message };
    }

    // Test 5: Check if stores table exists
    try {
      const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name')
        .limit(1);
      
      if (storesError) {
        results.tests.stores = {
          status: 'error',
          error: storesError.message,
          code: storesError.code,
          details: storesError.details,
          hint: storesError.hint,
        };
      } else {
        results.tests.stores = {
          status: 'ok',
          count: stores?.length || 0,
        };
      }
    } catch (e: any) {
      results.tests.stores = { status: 'exception', error: e.message };
    }

    // Test 6: Try to create a test user
    const testUserId = 'test-' + Date.now();
    try {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: testUserId,
          email: `test-${testUserId}@example.com`,
          full_name: 'Test User',
        });
      
      if (insertError) {
        results.tests.insert_user = {
          status: 'error',
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
        };
      } else {
        // Clean up - delete the test user
        await supabase.from('users').delete().eq('id', testUserId);
        results.tests.insert_user = { status: 'ok', message: 'Can insert users' };
      }
    } catch (e: any) {
      results.tests.insert_user = { status: 'exception', error: e.message };
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    results.error = {
      message: error?.message,
      stack: error?.stack,
    };
    return NextResponse.json(results, { status: 500 });
  }
}

