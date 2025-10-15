'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthButton } from '@/components/AuthButton';
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Trash2,
  Eye,
  Archive,
  Clock,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { GroceryList } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [lists, setLists] = useState<GroceryList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'all'>('active');

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Load user's lists
  useEffect(() => {
    async function loadLists() {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/lists?userId=${user.id}&status=${filter}`);
        if (response.ok) {
          const { lists: fetchedLists } = await response.json();
          setLists(fetchedLists || []);
        }
      } catch (error) {
        console.error('Error loading lists:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!userLoading) {
      loadLists();
    }
  }, [user, filter, userLoading]);

  const deleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete list');
      }

      setLists(lists.filter(list => list.id !== listId));
    } catch (error) {
      console.error('Error deleting list:', error);
      alert('Failed to delete list. Please try again.');
    }
  };

  const archiveList = async (listId: string) => {
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: false, status: 'archived' }),
      });

      if (!response.ok) {
        throw new Error('Failed to archive list');
      }

      setLists(lists.map(list =>
        list.id === listId
          ? { ...list, is_active: false, status: 'archived' }
          : list
      ));
    } catch (error) {
      console.error('Error archiving list:', error);
      alert('Failed to archive list. Please try again.');
    }
  };

  if (userLoading || (isLoading && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-lime" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="safe-top border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <h1 className="text-2xl font-bold">My Lists</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-8">
          <div className="inline-flex rounded-full bg-muted p-1 gap-1">
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'active'
                  ? 'bg-primary-lime text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active Lists
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-primary-lime text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All Lists
            </button>
          </div>

          <Button
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New List
          </Button>
        </div>

        {/* Lists Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-lime" />
          </div>
        ) : lists.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No lists yet</h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'active'
                ? "You don't have any active lists. Start by creating a new one!"
                : "You haven't created any lists yet."}
            </p>
            <Button onClick={() => router.push('/')} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First List
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => {
              const itemCount = list.items?.length || 0;
              const purchasedCount = list.items?.filter(item => item.purchased).length || 0;
              const progress = itemCount > 0 ? Math.round((purchasedCount / itemCount) * 100) : 0;

              return (
                <Card key={list.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 truncate">{list.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(list.created_at)}
                      </p>
                    </div>
                    {list.status === 'archived' && (
                      <Badge variant="secondary">
                        <Archive className="h-3 w-3 mr-1" />
                        Archived
                      </Badge>
                    )}
                  </div>

                  {/* List Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{itemCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Purchased</span>
                      <span className="font-medium">{purchasedCount}</span>
                    </div>
                    {/* Progress Bar */}
                    {itemCount > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-primary-lime transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => router.push(`/results/${list.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </Button>
                    {list.is_active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => archiveList(list.id)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteList(list.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

