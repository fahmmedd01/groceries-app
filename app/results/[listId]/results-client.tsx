'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowLeft, ExternalLink, TrendingDown } from 'lucide-react';
import { ListItem, Retailer, GroceryList, GroceryItem, RetailerProduct } from '@/lib/types';
import { formatPrice } from '@/lib/utils';
interface ResultsClientProps {
  list: GroceryList;
  items: ListItem[];
}

// Generate AI products on the client side for temporary lists
async function generateProductsForItem(item: GroceryItem, selectedRetailers: Retailer[]): Promise<RetailerProduct[]> {
  const retailers = selectedRetailers;
  
  // Simple fallback generation (AI generation happens on server)
  return retailers.map((retailer, index) => ({
    retailer,
    title: `${item.name.charAt(0).toUpperCase() + item.name.slice(1)} - ${item.brand || 'Store Brand'}`,
    brand: item.brand || 'Store Brand',
    size: item.size || 'Standard Size',
    price: 4.99 + (index * 0.75) + (Math.random() * 2),
    stockStatus: Math.random() > 0.8 ? 'low-stock' : 'in-stock' as any,
    productUrl: `https://${retailer}.com/search?q=${encodeURIComponent(item.name)}`,
    imageUrl: `https://via.placeholder.com/300/E8F0D5/2D2D2D?text=${encodeURIComponent(item.name.substring(0, 20))}`,
  }));
}

export function ResultsClient({ list, items: initialItems }: ResultsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('best-price');
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [loading, setLoading] = useState(false);
  
  // Extract unique retailers from initial items' matches (for database-loaded lists)
  const initialRetailers = useMemo(() => {
    if (initialItems.length > 0) {
      const retailersSet = new Set<Retailer>();
      initialItems.forEach(item => {
        item.matches?.forEach(match => {
          retailersSet.add(match.retailer);
        });
      });
      return Array.from(retailersSet);
    }
    return ['walmart', 'walgreens', 'marianos', 'costco', 'samsclub'] as Retailer[];
  }, [initialItems]);
  
  const [selectedRetailers, setSelectedRetailers] = useState<Retailer[]>(initialRetailers);

  // Load items from sessionStorage for temp lists
  useEffect(() => {
    if (list.id.startsWith('temp-') && initialItems.length === 0) {
      const storedData = sessionStorage.getItem(`list-${list.id}`);
      if (storedData) {
        setLoading(true);
        try {
          const { items: groceryItems, zipCode, retailers } = JSON.parse(storedData);
          
          // Update selected retailers from stored data
          if (retailers && Array.isArray(retailers)) {
            setSelectedRetailers(retailers as Retailer[]);
          }
          
          // Generate products for each item
          Promise.all(
            groceryItems.map(async (item: GroceryItem, index: number) => {
              const matches = await generateProductsForItem(item, retailers as Retailer[] || selectedRetailers);
              return {
                id: `temp-item-${index}`,
                list_id: list.id,
                name: item.name,
                brand: item.brand || null,
                quantity: item.quantity,
                size: item.size || null,
                notes: item.notes?.join(', ') || null,
                order_index: index,
                matches: matches,
              };
            })
          ).then(matchedItems => {
            setItems(matchedItems);
            list.zip_code = zipCode;
            setLoading(false);
          });
        } catch (error) {
          console.error('Error loading temp list data:', error);
          setLoading(false);
        }
      }
    }
  }, [list.id, initialItems, list]);

  // Calculate best prices
  const bestPriceData = useMemo(() => {
    return items.map(item => {
      const matches = item.matches || [];
      const bestMatch = matches.reduce((best, current) => {
        if (!best || current.price < best.price) {
          return current;
        }
        return best;
      }, matches[0]);

      return {
        item,
        bestMatch,
        savings: matches.length > 1
          ? Math.max(...matches.map(m => m.price)) - (bestMatch?.price || 0)
          : 0,
      };
    });
  }, [items]);

  // Calculate totals
  const totalBestPrice = bestPriceData.reduce(
    (sum, { item, bestMatch }) => sum + (bestMatch?.price || 0) * (item.quantity || 1),
    0
  );

  // Filter items by retailer
  const getItemsByRetailer = (retailer: Retailer) => {
    return items
      .map(item => ({
        item,
        match: item.matches?.find(m => m.retailer === retailer),
      }))
      .filter(({ match }) => match !== undefined);
  };

  // Use selected retailers from state (loaded from sessionStorage or database)
  const retailers = selectedRetailers;
  const retailerNames = {
    walmart: 'Walmart',
    walgreens: 'Walgreens',
    marianos: "Mariano's",
    costco: 'Costco',
    samsclub: "Sam's Club",
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
            <h1 className="text-xl font-bold truncate">{list.title}</h1>
            <div className="w-20" /> {/* Spacer for alignment */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Summary Card */}
        <Card className="p-6 mb-8 bg-primary-lime-bg border-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Grocery List</h2>
              <p className="text-muted-foreground">
                {items.length} items • ZIP Code: {list.zip_code}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">
                Estimated Best Price Total
              </p>
              <p className="text-3xl font-bold text-primary-lime">
                {formatPrice(totalBestPrice)}
              </p>
            </div>
          </div>
        </Card>

        {/* Retailer Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto">
              <TabsTrigger value="best-price" className="gap-2">
                <TrendingDown className="h-4 w-4" />
                Best Price
              </TabsTrigger>
              {retailers.map(retailer => {
                const retailerItems = getItemsByRetailer(retailer);
                return (
                  <TabsTrigger key={retailer} value={retailer}>
                    {retailerNames[retailer]}
                    <Badge variant="secondary" className="ml-2">
                      {retailerItems.length}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Best Price Tab */}
          <TabsContent value="best-price">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestPriceData.map(({ item, bestMatch, savings }) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  product={bestMatch}
                  isBestPrice
                  savings={savings}
                />
              ))}
            </div>
          </TabsContent>

          {/* Retailer Tabs */}
          {retailers.map(retailer => {
            const retailerItems = getItemsByRetailer(retailer);
            return (
              <TabsContent key={retailer} value={retailer}>
                {retailerItems.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {retailerItems.map(({ item, match }) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        product={match!}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <p className="text-muted-foreground">
                      No items available at {retailerNames[retailer]}
                    </p>
                  </Card>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </main>

      {/* Footer Spacer */}
      <div className="h-24 safe-bottom" />
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  item: ListItem;
  product: any;
  isBestPrice?: boolean;
  savings?: number;
}

function ProductCard({ item, product, isBestPrice, savings }: ProductCardProps) {
  const stockColors = {
    'in-stock': 'success',
    'low-stock': 'warning',
    'out-of-stock': 'destructive',
  };

  return (
    <Card className="overflow-hidden hover:shadow-float transition-all">
      {/* Product Image */}
      <div className="relative h-48 bg-gradient-to-br from-primary-lime-bg to-secondary-lavender-bg flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-6xl mb-2">🛒</div>
          <p className="text-sm font-medium text-muted-foreground">{item.name}</p>
        </div>
        {isBestPrice && savings && savings > 0 && (
          <div className="absolute top-2 right-2">
            <Badge variant="success" className="gap-1">
              <TrendingDown className="h-3 w-3" />
              Save {formatPrice(savings)}
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold line-clamp-2 text-sm flex-1">
            {product.title}
          </h3>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground mb-4">
          <p>Brand: {product.brand}</p>
          <p>Size: {product.size}</p>
          <p>
            Requested: {item.quantity} item{item.quantity > 1 ? 's' : ''}
          </p>
          {item.notes && <p className="text-xs italic">Note: {item.notes}</p>}
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-primary-lime">
              {formatPrice(product.price)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                Total: {formatPrice(product.price * item.quantity)}
              </p>
            )}
          </div>
          <Badge variant={stockColors[product.stockStatus as keyof typeof stockColors] as any}>
            {product.stockStatus.replace('-', ' ')}
          </Badge>
        </div>

        {/* Actions */}
        <Button
          asChild
          variant="outline"
          className="w-full gap-2"
        >
          <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Open in Store
          </a>
        </Button>
      </div>
    </Card>
  );
}

