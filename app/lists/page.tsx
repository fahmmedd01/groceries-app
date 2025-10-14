import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ListsClient } from './lists-client';

export default async function ListsPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/');
  }

  // Fetch user's lists
  const { data: lists, error } = await supabase
    .from('grocery_lists')
    .select(`
      *,
      list_items (count)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lists:', error);
  }

  return <ListsClient lists={lists || []} />;
}

