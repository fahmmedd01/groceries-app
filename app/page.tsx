'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceInput } from '@/components/VoiceInput';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mic, Type, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [inputText, setInputText] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRetailers, setSelectedRetailers] = useState<string[]>([]);

  const handleBuildList = async () => {
    if (!inputText.trim()) {
      setError('Please add some grocery items first.');
      return;
    }

    if (!zipCode.trim()) {
      setError('Please enter your ZIP code for location-based results.');
      return;
    }

    if (selectedRetailers.length === 0) {
      setError('Please select at least one retailer to compare prices.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Parse the grocery input using Claude AI
      const parseResponse = await fetch('/api/parse-grocery-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText }),
      });

      if (!parseResponse.ok) {
        throw new Error('Failed to parse grocery items');
      }

      const { items } = await parseResponse.json();

      // Match products from retailers
      const matchResponse = await fetch('/api/match-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, zipCode, retailers: selectedRetailers }),
      });

      if (!matchResponse.ok) {
        throw new Error('Failed to match products');
      }

      const { listId } = await matchResponse.json();

      // Store the parsed items and matches in sessionStorage for temp lists
      if (listId.startsWith('temp-')) {
        sessionStorage.setItem(`list-${listId}`, JSON.stringify({
          items: items,
          zipCode: zipCode,
          retailers: selectedRetailers,
          createdAt: new Date().toISOString(),
        }));
      }

      // Navigate to results page
      router.push(`/results/${listId}`);
    } catch (err) {
      console.error('Error building list:', err);
      setError('Failed to build your grocery list. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="safe-top border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-primary-lime" />
            <h1 className="text-2xl font-bold">Voice Grocery Assistant</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Build Your Grocery List
          </h2>
          <p className="text-lg text-muted-foreground">
            Use voice or text to create your shopping list and compare prices across stores
          </p>
        </div>

        {/* Input Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-muted p-1 gap-1">
            <button
              onClick={() => setInputMode('voice')}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all',
                inputMode === 'voice'
                  ? 'bg-primary-lime text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Mic className="h-4 w-4" />
              Voice
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={cn(
                'inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all',
                inputMode === 'text'
                  ? 'bg-primary-lime text-white shadow-md'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Type className="h-4 w-4" />
              Text
            </button>
          </div>
        </div>

        {/* Input Area Card */}
        <Card className="p-8 mb-8">
          {inputMode === 'voice' ? (
            <VoiceInput
              onTranscriptChange={setInputText}
              className="mb-6"
            />
          ) : (
            <TextInput
              onTextChange={setInputText}
              className="mb-6"
            />
          )}

          {/* ZIP Code Input */}
          <div className="mt-6">
            <label htmlFor="zipCode" className="block text-sm font-medium mb-2">
              Your ZIP Code
            </label>
            <Input
              id="zipCode"
              type="text"
              placeholder="Enter ZIP code (e.g., 60601)"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={10}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">
              We'll use this to check availability and prices in your area
            </p>
          </div>

          {/* Retailer Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-3">
              Select Retailers to Compare
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'walmart', name: 'Walmart', color: 'bg-primary-lime-bg' },
                { id: 'walgreens', name: 'Walgreens', color: 'bg-red-50' },
                { id: 'marianos', name: "Mariano's", color: 'bg-secondary-lavender-bg' },
                { id: 'costco', name: 'Costco', color: 'bg-blue-50' },
                { id: 'samsclub', name: "Sam's Club", color: 'bg-accent-peach/30' },
              ].map((retailer) => (
                <label
                  key={retailer.id}
                  className={cn(
                    'flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all',
                    selectedRetailers.includes(retailer.id)
                      ? 'border-primary-lime bg-primary-lime-bg shadow-md'
                      : 'border-gray-200 hover:border-gray-300',
                    retailer.color
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedRetailers.includes(retailer.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRetailers([...selectedRetailers, retailer.id]);
                      } else {
                        setSelectedRetailers(selectedRetailers.filter(r => r !== retailer.id));
                      }
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-primary-lime focus:ring-primary-lime"
                  />
                  <span className="font-medium">{retailer.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Select one or more retailers to compare prices (selecting all gives you the best comparison)
            </p>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border-2 border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Build List Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleBuildList}
            disabled={isProcessing || !inputText.trim() || !zipCode.trim()}
            size="lg"
            className="px-12"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Building List...
              </>
            ) : (
              <>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Build My List
              </>
            )}
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-primary-lime-bg border-0">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-lime text-white mb-4">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Voice Powered</h3>
              <p className="text-sm text-muted-foreground">
                Simply speak your grocery list naturally
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-secondary-lavender-bg border-0">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-secondary-lavender text-white mb-4">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">5 Retailers</h3>
              <p className="text-sm text-muted-foreground">
                Compare prices from major stores instantly
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-accent-peach/30 border-0">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-coral text-white mb-4">
                <span className="text-xl font-bold">$</span>
              </div>
              <h3 className="font-semibold mb-2">Best Prices</h3>
              <p className="text-sm text-muted-foreground">
                Find the best deals automatically
              </p>
            </div>
          </Card>
        </div>
      </main>

      {/* Footer Spacer for Mobile Navigation */}
      <div className="h-24 safe-bottom" />
    </div>
  );
}

