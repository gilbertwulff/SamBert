'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import ExpenseList from '@/components/dashboard/ExpenseList';
import { getMonthlyTotal, getCategoryBreakdown } from '@/lib/db';
import { User } from '@/lib/types';

interface HomePageProps {
  currentUser: User;
  onViewAllTransactions: () => void;
}

export default function HomePage({ currentUser, onViewAllTransactions }: HomePageProps) {
  const [userTotal, setUserTotal] = useState(0);
  const [categoryStats, setCategoryStats] = useState<{[key: string]: number}>({});
  const [loading, setLoading] = useState(true);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const userBudgetPercentage = currentUser.budgetCap ? (userTotal / currentUser.budgetCap) * 100 : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [total, categoryBreakdown] = await Promise.all([
          getMonthlyTotal(currentUser.id, currentMonth, currentYear),
          getCategoryBreakdown(currentUser.id, currentMonth, currentYear)
        ]);
        
        setUserTotal(total);
        
        // Convert category breakdown to object for easier lookup
        const categoryMap: {[key: string]: number} = {};
        categoryBreakdown.forEach((category: { name: string; value: number }) => {
          categoryMap[category.name] = category.value;
        });
        setCategoryStats(categoryMap);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id, currentMonth, currentYear]);

  const formatCurrency = (amount: number) => `RM${amount.toFixed(2)}`;

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { emoji: '🚨', color: 'text-red-600' };
    if (percentage >= 90) return { emoji: '⚠️', color: 'text-orange-600' };
    if (percentage >= 75) return { emoji: '🟡', color: 'text-yellow-600' };
    return { emoji: '✅', color: 'text-green-600' };
  };

  const userStatus = getBudgetStatus(userBudgetPercentage);

  const getMonthName = (month: number) => {
    return new Date(2024, month).toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <div className="p-4 space-y-6">
        {/* Welcome Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">
            {currentUser.id === 1 ? '👤' : '💕'} Welcome back, {currentUser.name}!
          </h2>
          <p className="text-gray-600">{getMonthName(currentMonth)} {currentYear}</p>
        </div>

        {/* Personal Spending Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              💰 Your Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? 'Loading...' : formatCurrency(userTotal)}
            </div>
            {currentUser.budgetCap && (
              <>
                <div className="text-sm text-gray-600 mt-1">
                  of {formatCurrency(currentUser.budgetCap)} budget ({userBudgetPercentage.toFixed(0)}%) {userStatus.emoji}
                </div>
                <Progress value={Math.min(userBudgetPercentage, 100)} className="mt-2" />
              </>
            )}
            {!currentUser.budgetCap && (
              <div className="text-sm text-gray-500 mt-1">
                No budget set - tap settings to add one
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Category Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'Food', emoji: '🍔', color: 'border-green-200' },
            { name: 'Online Shopping', emoji: '📦', color: 'border-green-200' },
            { name: 'Entertainment', emoji: '🎬', color: 'border-green-200' }
          ].map((category) => (
            <Card key={category.name} className={`${category.color} bg-white`}>
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-2">{category.emoji}</div>
                <div className="font-bold text-lg">
                  {loading ? '...' : formatCurrency(categoryStats[category.name] || 0)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Expenses - Now at the top */}
        <ExpenseList
          currentUser={currentUser}
          currentMonth={currentMonth}
          currentYear={currentYear}
          viewMode="individual"
          title="📝 Your Recent Expenses"
          limit={8}
          showViewMore={true}
          onViewMore={onViewAllTransactions}
        />

        {/* Bottom padding for FAB */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
