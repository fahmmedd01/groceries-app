'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ShoppingCart, Trash2, ExternalLink, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

interface ListsClientProps {
  lists: any[];
}

export function ListsClient({ lists }: ListsClientProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list?')) {
      return;
    }

    setIsDeleting(listId);
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('grocery_lists')
        .delete()
        .eq('id', listId);

      if (error) {
        console.error('Error deleting list:', error);
        alert('Failed to delete list. Please try again.');
        return;
      }

      router.refresh();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to delete list. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExport = (listId: string) => {
    window.open(`/api/lists/${listId}/export`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="safe-top border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold">My Lists</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {lists.length === 0 ? (
          <Card className="p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No saved lists yet</h2>
            <p className="text-muted-foreground mb-6">
              Create your first grocery list to get started!
            </p>
            <Button onClick={() => router.push('/')}>
              Create List
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {lists.map((list) => (
              <Card key={list.id} className="p-6 hover:shadow-float transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{list.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>{formatDate(list.created_at)}</span>
                      <span>•</span>
                      <span>ZIP: {list.zip_code}</span>
                      <span>•</span>
                      <Badge variant="secondary">
                        {list.list_items?.[0]?.count || 0} items
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push(`/results/${list.id}`)}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(list.id)}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(list.id)}
                    disabled={isDeleting === list.id}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isDeleting === list.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer Spacer */}
      <div className="h-24 safe-bottom" />
    </div>
  );
}

