'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { VoiceInput } from '@/components/VoiceInput';
import { TextInput } from '@/components/TextInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthButton } from '@/components/AuthButton';
import { Mic, Type, ShoppingCart, Loader2, LayoutDashboard, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function HomePage() {
  const router = useRouter();
  const { user } = useUser();
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRetailer, setSelectedRetailer] = useState<string>('');
  const [customRetailer, setCustomRetailer] = useState('');

  const handleAddItems = async () => {
    if (!inputText.trim()) {
      setError('Please add some grocery items first.');
      return;
    }

    if (!selectedRetailer) {
      setError('Please select a retailer.');
      return;
    }

    if (selectedRetailer === 'other' && !customRetailer.trim()) {
      setError('Please enter a retailer name.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

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

      // Add items to active list
      const addResponse = await fetch('/api/items/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          userId: user?.id,
          retailer: selectedRetailer,
          customRetailer: customRetailer,
        }),
      });

      if (!addResponse.ok) {
        throw new Error('Failed to add items');
      }

      const { listId, itemCount } = await addResponse.json();

      // Clear input and show success
      setInputText('');
      setSuccess(`Added ${itemCount} item${itemCount !== 1 ? 's' : ''} to your list!`);
      
      // Auto-redirect to list after 2 seconds
      setTimeout(() => {
        router.push(`/results/${listId}`);
      }, 2000);
    } catch (err) {
      console.error('Error adding items:', err);
      setError('Failed to add items. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="safe-top border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-8 w-8 text-primary-lime" />
              <h1 className="text-2xl font-bold">Grocery List</h1>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/dashboard')}
                    className="gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="hidden sm:inline">Dashboard</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/stores')}
                    className="gap-2"
                  >
                    <Store className="h-4 w-4" />
                    <span className="hidden sm:inline">Stores</span>
                  </Button>
                </>
              )}
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Add Items to Your List
          </h2>
          <p className="text-lg text-muted-foreground">
            Use voice or text to add items to your grocery list
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

        {/* Input Card */}
        <Card className="p-6 mb-6">
          {/* Voice or Text Input */}
          {inputMode === 'voice' ? (
            <VoiceInput
              onTranscriptChange={setInputText}
              className="mb-6"
            />
          ) : (
            <TextInput
              value={inputText}
              onTextChange={setInputText}
              className="mb-6"
            />
          )}

          {/* Retailer Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-3">
              Select Retailer
            </label>
            <Select value={selectedRetailer} onValueChange={setSelectedRetailer}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a retailer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="walmart">Walmart</SelectItem>
                <SelectItem value="walgreens">Walgreens</SelectItem>
                <SelectItem value="marianos">Mariano&apos;s</SelectItem>
                <SelectItem value="costco">Costco</SelectItem>
                <SelectItem value="samsclub">Sam&apos;s Club</SelectItem>
                <SelectItem value="other">Other (Custom)</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Custom Retailer Input */}
            {selectedRetailer === 'other' && (
              <div className="mt-4">
                <label htmlFor="customRetailer" className="block text-sm font-medium mb-2">
                  Retailer Name
                </label>
                <Input
                  id="customRetailer"
                  type="text"
                  placeholder="Enter retailer name..."
                  value={customRetailer}
                  onChange={(e) => setCustomRetailer(e.target.value)}
                />
              </div>
            )}
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border-2 border-red-200 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-2xl bg-green-50 border-2 border-green-200 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Add Items Button */}
        <Button
          onClick={handleAddItems}
          disabled={isProcessing || !inputText.trim() || !selectedRetailer}
          className="w-full gap-3"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Adding Items...
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              Add Items to List
            </>
          )}
        </Button>

        {/* Helpful Tips */}
        <div className="mt-8 p-6 bg-primary-lime-bg rounded-2xl">
          <h3 className="font-semibold mb-2">Tips for Best Results:</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Say or type items naturally: &quot;2 cartons of eggs and 1 gallon of milk&quot;</li>
            <li>• Include quantities and sizes for better organization</li>
            <li>• Mention brands if you have a preference</li>
            <li>• Select the store you plan to shop at</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
