'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AuthButton } from '@/components/AuthButton';
import { ArrowLeft, CheckCircle2, ShoppingCart, Edit2, Trash2, LayoutDashboard } from 'lucide-react';
import { ListItem, GroceryList } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ResultsClientProps {
  list: GroceryList;
  items: ListItem[];
}

export function ResultsClient({ list, items: initialItems }: ResultsClientProps) {
  const router = useRouter();
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [showPurchased, setShowPurchased] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Calculate purchase progress
  const purchasedCount = items.filter(item => item.purchased).length;
  const totalCount = items.length;
  const purchaseProgress = totalCount > 0 ? Math.round((purchasedCount / totalCount) * 100) : 0;

  // Filter items based on purchased status
  const displayItems = showPurchased ? items : items.filter(item => !item.purchased);

  // Group items by retailer
  const itemsByRetailer = displayItems.reduce((acc, item) => {
    const retailer = item.retailer || 'other';
    if (!acc[retailer]) {
      acc[retailer] = [];
    }
    acc[retailer].push(item);
    return acc;
  }, {} as Record<string, ListItem[]>);

  const togglePurchased = async (itemId: string, purchased: boolean, retailer?: string) => {
    setUpdatingItemId(itemId);

    try {
      const response = await fetch(`/api/items/${itemId}/toggle-purchased`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchased, retailer }),
      });

      if (!response.ok) {
        throw new Error('Failed to update purchased status');
      }

      // Update local state
      const updatedItems = items.map(item =>
        item.id === itemId
          ? {
              ...item,
              purchased,
              purchased_retailer: purchased && retailer ? retailer : null,
              purchased_at: purchased ? new Date().toISOString() : null,
            }
          : item
      );
      setItems(updatedItems);
    } catch (error) {
      console.error('Error toggling purchased status:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const retailerNames: Record<string, string> = {
    // Warehouse Clubs
    costco: 'Costco',
    samsclub: "Sam's Club",
    bjs: "BJ's Wholesale",
    
    // Supermarkets
    walmart: 'Walmart',
    target: 'Target',
    kroger: 'Kroger',
    publix: 'Publix',
    safeway: 'Safeway',
    albertsons: 'Albertsons',
    heb: 'H-E-B',
    meijer: 'Meijer',
    wegmans: 'Wegmans',
    gianteagle: 'Giant Eagle',
    foodlion: 'Food Lion',
    stopandshop: 'Stop & Shop',
    giantfood: 'Giant Food',
    marianos: "Mariano's",
    harristeeter: 'Harris Teeter',
    shoprite: 'ShopRite',
    ralphs: 'Ralphs',
    fredmeyer: 'Fred Meyer',
    qfc: 'QFC',
    kingsoopers: 'King Soopers',
    smiths: "Smith's",
    frys: "Fry's",
    dillons: 'Dillons',
    marketbasket: 'Market Basket',
    wincofoods: 'WinCo Foods',
    lidl: 'Lidl',
    
    // Specialty Grocers
    wholefoods: 'Whole Foods',
    traderjoes: "Trader Joe's",
    aldi: 'Aldi',
    sprouts: 'Sprouts',
    freshthyme: 'Fresh Thyme',
    
    // Pharmacies
    cvs: 'CVS',
    walgreens: 'Walgreens',
    riteaid: 'Rite Aid',
    duanereade: 'Duane Reade',
    
    // Fallback
    other: 'Other',
  };

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
              <h1 className="text-xl font-bold truncate">{list.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Summary Card */}
        <Card className="p-6 mb-8 bg-primary-lime-bg border-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">Your Grocery List</h2>
                {purchasedCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPurchased(!showPurchased)}
                    className="ml-4"
                  >
                    {showPurchased ? 'Hide' : 'Show'} Purchased ({purchasedCount})
                  </Button>
                )}
              </div>
              <p className="text-muted-foreground mb-3">
                {displayItems.length} items shown • {items.length} total
              </p>
              {/* Purchase Progress */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-primary-lime" />
                  <span className="font-medium">
                    {purchasedCount} of {totalCount} items purchased ({purchaseProgress}%)
                  </span>
                </div>
                <div className="w-full max-w-xs bg-white/50 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary-lime transition-all duration-300"
                    style={{ width: `${purchaseProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Items Grouped by Retailer */}
        <div className="space-y-8">
          {Object.entries(itemsByRetailer).map(([retailer, retailerItems]) => (
            <div key={retailer}>
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="h-5 w-5 text-primary-lime" />
                <h3 className="text-xl font-bold">
                  {retailerNames[retailer] || retailer}
                </h3>
                <Badge variant="secondary">{retailerItems.length}</Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {retailerItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onTogglePurchased={togglePurchased}
                    onDelete={deleteItem}
                    isUpdating={updatingItemId === item.id}
                    isEditing={editingItem === item.id}
                    setEditing={setEditingItem}
                  />
                ))}
              </div>
            </div>
          ))}

          {displayItems.length === 0 && (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                {purchasedCount > 0
                  ? 'All items purchased! 🎉'
                  : 'No items in your list yet.'}
              </p>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="mt-4"
              >
                Add Items
              </Button>
            </Card>
          )}
        </div>
      </main>

      {/* Footer Spacer */}
      <div className="h-24 safe-bottom" />
    </div>
  );
}

// Item Card Component
interface ItemCardProps {
  item: ListItem;
  onTogglePurchased: (itemId: string, purchased: boolean, retailer?: string) => Promise<void>;
  onDelete: (itemId: string) => Promise<void>;
  isUpdating: boolean;
  isEditing: boolean;
  setEditing: (itemId: string | null) => void;
}

function ItemCard({ item, onTogglePurchased, onDelete, isUpdating, isEditing, setEditing }: ItemCardProps) {
  const isPurchased = item.purchased || false;

  return (
    <Card className={cn(
      "p-4 transition-all",
      isPurchased && "opacity-60 bg-gray-50"
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <input
            type="checkbox"
            checked={isPurchased}
            onChange={(e) => onTogglePurchased(item.id, e.target.checked, item.retailer)}
            disabled={isUpdating}
            className="mt-1 w-5 h-5 rounded border-gray-300 text-primary-lime focus:ring-primary-lime cursor-pointer"
          />
          <div className="flex-1">
            <h4 className={cn(
              "font-semibold text-lg",
              isPurchased && "line-through text-muted-foreground"
            )}>
              {item.name}
            </h4>
            <div className="text-sm text-muted-foreground space-y-1 mt-1">
              {item.brand && <p>Brand: {item.brand}</p>}
              {item.size && <p>Size: {item.size}</p>}
              <p className="font-medium text-primary-lime">
                Quantity: {item.quantity}
              </p>
              {item.notes && <p className="italic">Note: {item.notes}</p>}
            </div>
          </div>
        </div>
        
        {!isPurchased && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isPurchased && item.purchased_at && (
        <p className="text-xs text-muted-foreground mt-2">
          Purchased {new Date(item.purchased_at).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
}
