'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatsCards from './StatsCards';
import CategoryChart from './CategoryChart';
import ExpenseList from './ExpenseList';
import { User } from '@/lib/types';

interface DashboardProps {
  currentUser: User;
}

type ViewMode = 'individual' | 'combined' | 'shared';

export default function Dashboard({ currentUser }: DashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('individual');
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getMonthName = (month: number) => {
    return new Date(2024, month).toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="p-4 space-y-6">
        {/* Month Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">{getMonthName(currentMonth)} {currentYear}</h2>
        </div>

        {/* View Mode Toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex space-x-2">
              <Button
                variant={viewMode === 'individual' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setViewMode('individual')}
              >
                👤 Individual
              </Button>
              <Button
                variant={viewMode === 'combined' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setViewMode('combined')}
              >
                📊 Combined
              </Button>
              <Button
                variant={viewMode === 'shared' ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setViewMode('shared')}
              >
                🤝 Shared
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <StatsCards 
          currentUser={currentUser}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />

        {/* Category Chart */}
        <CategoryChart
          currentUser={currentUser}
          currentMonth={currentMonth}
          currentYear={currentYear}
          viewMode={viewMode}
        />

        {/* Expense List */}
        <ExpenseList
          currentUser={currentUser}
          currentMonth={currentMonth}
          currentYear={currentYear}
          viewMode={viewMode}
        />

        {/* Bottom padding for FAB */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
