'use client';

import { Button } from '@/components/ui/button';
import { clearCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';

interface HeaderProps {
  currentUser: User;
}

export default function Header({ currentUser }: HeaderProps) {

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <h1 className="text-xl font-bold">💰 SamBert</h1>
      </div>
      
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600">
          {currentUser.id === 1 ? '👤' : '💕'} {currentUser.name}
        </span>
      </div>
    </header>
  );
}
