'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthButton } from '@/components/AuthButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Store as StoreIcon,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  MapPin,
} from 'lucide-react';
import { Store } from '@/lib/types';

export default function StoresPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newStore, setNewStore] = useState({
    name: '',
    retailer: '',
    address: '',
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Load user's stores
  useEffect(() => {
    async function loadStores() {
      if (!user?.id) return;

      try {
        const response = await fetch(`/api/stores?userId=${user.id}`);
        if (response.ok) {
          const { stores: fetchedStores } = await response.json();
          setStores(fetchedStores || []);
        }
      } catch (error) {
        console.error('Error loading stores:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (!userLoading) {
      loadStores();
    }
  }, [user, userLoading]);

  const handleAddStore = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newStore.name.trim() || !newStore.retailer) {
      alert('Please enter a store name and select a retailer');
      return;
    }

    try {
      const response = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...newStore,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add store');
      }

      const { store } = await response.json();
      setStores([...stores, store]);
      setNewStore({ name: '', retailer: '', address: '' });
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding store:', error);
      alert('Failed to add store. Please try again.');
    }
  };

  const deleteStore = async (storeId: string) => {
    if (!confirm('Are you sure you want to delete this store?')) {
      return;
    }

    try {
      const response = await fetch(`/api/stores/${storeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete store');
      }

      setStores(stores.filter(store => store.id !== storeId));
    } catch (error) {
      console.error('Error deleting store:', error);
      alert('Failed to delete store. Please try again.');
    }
  };

  const retailerOptions = [
    { value: 'walmart', label: 'Walmart' },
    { value: 'walgreens', label: 'Walgreens' },
    { value: 'marianos', label: "Mariano's" },
    { value: 'costco', label: 'Costco' },
    { value: 'samsclub', label: "Sam's Club" },
    { value: 'other', label: 'Other' },
  ];

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
              <h1 className="text-2xl font-bold">My Stores</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Add Store Button */}
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="mb-6 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Store
          </Button>
        )}

        {/* Add Store Form */}
        {isAdding && (
          <Card className="p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New Store</h3>
            <form onSubmit={handleAddStore} className="space-y-4">
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium mb-2">
                  Store Name *
                </label>
                <Input
                  id="storeName"
                  type="text"
                  placeholder="e.g., Walmart Supercenter"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="retailer" className="block text-sm font-medium mb-2">
                  Retailer *
                </label>
                <Select
                  value={newStore.retailer}
                  onValueChange={(value) => setNewStore({ ...newStore, retailer: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select retailer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {retailerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-2">
                  Address
                </label>
                <Input
                  id="address"
                  type="text"
                  placeholder="123 Main St, City, State 12345"
                  value={newStore.address}
                  onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Store
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewStore({ name: '', retailer: '', address: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Stores List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-lime" />
          </div>
        ) : stores.length === 0 ? (
          <Card className="p-12 text-center">
            <StoreIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No stores yet</h3>
            <p className="text-muted-foreground mb-6">
              Add your favorite stores to keep them organized.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {stores.map((store) => (
              <Card key={store.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-2">
                      <StoreIcon className="h-5 w-5 text-primary-lime mt-1" />
                      <div>
                        <h3 className="font-bold text-lg">{store.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {retailerOptions.find(r => r.value === store.retailer)?.label || store.retailer}
                        </p>
                      </div>
                    </div>
                    {store.address && (
                      <div className="flex items-start gap-3 ml-8">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-muted-foreground">{store.address}</p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteStore(store.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

