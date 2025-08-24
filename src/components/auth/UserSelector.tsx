'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getUsers } from '@/lib/db';
import { setCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';

interface UserSelectorProps {
  onUserSelected: (user: User) => void;
}

export default function UserSelector({ onUserSelected }: UserSelectorProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    onUserSelected(user);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">Loading...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">💰 SamBert</CardTitle>
          <CardDescription>
            Who&apos;s using the app today?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((user) => (
            <Button
              key={user.id}
              variant="outline"
              className="w-full h-16 text-lg"
              onClick={() => handleUserSelect(user)}
            >
              <span className="mr-2">
                {user.id === 1 ? '👤' : '💕'}
              </span>
              {user.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
