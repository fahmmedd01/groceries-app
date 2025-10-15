'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthButton } from '@/components/AuthButton';
import {
  ArrowLeft,
  Settings as SettingsIcon,
  User as UserIcon,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setName(user.full_name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      alert('Please enter both name and email');
      return;
    }

    setIsUpdating(true);

    try {
      // Update localStorage (simple auth)
      const updatedUser = {
        ...user,
        full_name: name.trim(),
        email: email.trim(),
      };
      
      localStorage.setItem('grocery_user', JSON.stringify(updatedUser));
      window.location.reload(); // Reload to update context
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClearAllData = () => {
    if (!confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      return;
    }

    // Clear localStorage
    localStorage.clear();
    
    // Redirect to home
    router.push('/');
    window.location.reload();
  };

  const handleExportLists = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/lists?userId=${user.id}&status=all`);
      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }

      const { lists } = await response.json();

      // Create a JSON file for download
      const dataStr = JSON.stringify(lists, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `grocery-lists-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting lists:', error);
      alert('Failed to export lists. Please try again.');
    }
  };

  if (userLoading || (!user && !userLoading)) {
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
              <h1 className="text-2xl font-bold">Settings</h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Profile Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <UserIcon className="h-6 w-6 text-primary-lime" />
            <h2 className="text-xl font-bold">Profile Settings</h2>
          </div>
          
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
              />
            </div>

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </form>
        </Card>

        {/* Data Management */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="h-6 w-6 text-primary-lime" />
            <h2 className="text-xl font-bold">Data Management</h2>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Export All Lists</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Download all your grocery lists as a JSON file for backup.
              </p>
              <Button
                onClick={handleExportLists}
                variant="outline"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export Lists
              </Button>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Clearing all data will remove your profile and lists from this device.
                This action cannot be undone.
              </p>
              <Button
                onClick={handleClearAllData}
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4" />
                Clear All Data
              </Button>
            </div>
          </div>
        </Card>

        {/* Notifications Placeholder */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="h-6 w-6 text-primary-lime" />
            <h2 className="text-xl font-bold">Notifications</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Notification preferences will be available in a future update.
          </p>
        </Card>
      </main>
    </div>
  );
}

