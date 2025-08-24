'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatsCards from './StatsCards';
import CategoryChart from './CategoryChart';
import ExpenseList from './ExpenseList';
import PinjamSummary from './PinjamSummary';
import { User } from '@/lib/types';

interface DashboardPageProps {
  currentUser: User;
}

type ViewMode = 'individual' | 'combined' | 'shared';

export default function DashboardPage({ currentUser }: DashboardPageProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getMonthName = (month: number) => {
    return new Date(2024, month).toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <div className="p-4 space-y-6">
        {/* Dashboard Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">📊 Analytics Dashboard</h2>
          <p className="text-gray-600">{getMonthName(currentMonth)} {currentYear} Overview</p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'individual' ? 'default' : 'outline'}
            size="lg"
            className="flex-1 h-12"
            onClick={() => setViewMode('individual')}
          >
            👤
          </Button>
          <Button
            variant={viewMode === 'combined' ? 'default' : 'outline'}
            size="lg"
            className="flex-1 h-12"
            onClick={() => setViewMode('combined')}
          >
            📊
          </Button>
          <Button
            variant={viewMode === 'shared' ? 'default' : 'outline'}
            size="lg"
            className="flex-1 h-12"
            onClick={() => setViewMode('shared')}
          >
            🤝
          </Button>
        </div>

        {/* Stats Cards - Always show combined view */}
        <StatsCards 
          currentUser={currentUser}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />

        {/* Pinjam Summary */}
        <PinjamSummary currentUser={currentUser} />

        {/* Category Chart */}
        <CategoryChart
          currentUser={currentUser}
          currentMonth={currentMonth}
          currentYear={currentYear}
          viewMode={viewMode}
        />

        {/* Expense List with current view mode */}
        <ExpenseList
          currentUser={currentUser}
          currentMonth={currentMonth}
          currentYear={currentYear}
          viewMode={viewMode}
        />

        {/* Bottom padding for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
