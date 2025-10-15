'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';

interface UserContextType {
  user: User | null;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('grocery_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('grocery_user');
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (name: string, email: string) => {
    try {
      // Check if user exists in database by email
      const response = await fetch(`/api/users/find-by-email?email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const { user: existingUser } = await response.json();
        
        if (existingUser) {
          // User exists - use their existing ID
          const userData: User = {
            id: existingUser.id,
            email: existingUser.email,
            full_name: name, // Use the new name they provided
            created_at: existingUser.created_at,
          };
          
          // Update their name in database
          await fetch('/api/users/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: existingUser.id,
              fullName: name,
            }),
          });
          
          setUser(userData);
          localStorage.setItem('grocery_user', JSON.stringify(userData));
          return;
        }
      }
    } catch (error) {
      console.error('Error checking for existing user:', error);
    }
    
    // User doesn't exist - create new one
    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      full_name: name,
      created_at: new Date().toISOString(),
    };
    
    // Create user in database
    try {
      await fetch('/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
    
    setUser(newUser);
    localStorage.setItem('grocery_user', JSON.stringify(newUser));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('grocery_user');
  };

  return (
    <UserContext.Provider value={{ user, signIn, signOut, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

