'use client';

import { Button } from '@/components/ui/button';
import { Home, BarChart3, Settings, HandHeart } from 'lucide-react';

interface BottomNavigationProps {
  currentPage: 'home' | 'dashboard' | 'ious' | 'settings' | 'transactions';
  onPageChange: (page: 'home' | 'dashboard' | 'ious' | 'settings' | 'transactions') => void;
}

export default function BottomNavigation({ currentPage, onPageChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around">
        <Button
          variant={currentPage === 'home' ? 'default' : 'ghost'}
          className="flex-1 flex flex-col items-center py-2 h-auto"
          onClick={() => onPageChange('home')}
        >
          <Home className="h-5 w-5 mb-1" />
          <span className="text-xs">Home</span>
        </Button>
        
        <Button
          variant={currentPage === 'dashboard' ? 'default' : 'ghost'}
          className="flex-1 flex flex-col items-center py-2 h-auto"
          onClick={() => onPageChange('dashboard')}
        >
          <BarChart3 className="h-5 w-5 mb-1" />
          <span className="text-xs">Dashboard</span>
        </Button>

        <Button
          variant={currentPage === 'ious' ? 'default' : 'ghost'}
          className="flex-1 flex flex-col items-center py-2 h-auto"
          onClick={() => onPageChange('ious')}
        >
          <HandHeart className="h-5 w-5 mb-1" />
          <span className="text-xs">Pinjam</span>
        </Button>

        <Button
          variant={currentPage === 'settings' ? 'default' : 'ghost'}
          className="flex-1 flex flex-col items-center py-2 h-auto"
          onClick={() => onPageChange('settings')}
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-xs">Settings</span>
        </Button>
      </div>
    </div>
  );
}
