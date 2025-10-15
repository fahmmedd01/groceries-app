'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthButton() {
  const router = useRouter();
  const { user, signOut } = useUser();

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback>
            {user.full_name?.[0]?.toUpperCase() || 
             user.email?.[0]?.toUpperCase() || 
             <User className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block">
          <p className="text-sm font-medium">{user.full_name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      variant="default"
      size="sm"
      className="gap-2"
    >
      <LogIn className="h-4 w-4" />
      Sign In
    </Button>
  );
}

