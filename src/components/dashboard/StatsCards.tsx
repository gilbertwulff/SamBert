'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getMonthlyTotal, getCombinedMonthlyTotal, getSharedExpensesTotal, getUserById } from '@/lib/db';
import { User } from '@/lib/types';

interface StatsCardsProps {
  currentUser: User;
  currentMonth: number;
  currentYear: number;
}

export default function StatsCards({ currentUser, currentMonth, currentYear }: StatsCardsProps) {
  const [userTotal, setUserTotal] = useState(0);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [otherUserTotal, setOtherUserTotal] = useState(0);
  const [combinedTotal, setCombinedTotal] = useState(0);
  const [sharedTotal, setSharedTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const otherUserId = currentUser.id === 1 ? 2 : 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userTotalData, otherUserData, otherUserTotalData, combinedTotalData, sharedTotalData] = await Promise.all([
          getMonthlyTotal(currentUser.id, currentMonth, currentYear),
          getUserById(otherUserId),
          getMonthlyTotal(otherUserId, currentMonth, currentYear),
          getCombinedMonthlyTotal(currentMonth, currentYear),
          getSharedExpensesTotal(currentMonth, currentYear)
        ]);

        setUserTotal(userTotalData);
        setOtherUser(otherUserData || null);
        setOtherUserTotal(otherUserTotalData);
        setCombinedTotal(combinedTotalData);
        setSharedTotal(sharedTotalData);
      } catch (error) {
        console.error('Failed to fetch stats data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser.id, currentMonth, currentYear, otherUserId]);

  const userBudgetPercentage = currentUser.budgetCap ? (userTotal / currentUser.budgetCap) * 100 : 0;
  const otherUserBudgetPercentage = otherUser?.budgetCap ? (otherUserTotal / otherUser.budgetCap) * 100 : 0;

  const formatCurrency = (amount: number) => `RM${(amount || 0).toFixed(2)}`;

  const getBudgetStatus = (percentage: number) => {
    if (percentage >= 100) return { emoji: '🚨', color: 'text-red-600' };
    if (percentage >= 90) return { emoji: '⚠️', color: 'text-orange-600' };
    if (percentage >= 75) return { emoji: '🟡', color: 'text-yellow-600' };
    return { emoji: '✅', color: 'text-green-600' };
  };

  const userStatus = getBudgetStatus(userBudgetPercentage);
  const otherUserStatus = getBudgetStatus(otherUserBudgetPercentage);

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-gray-500">Loading stats...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Individual Totals */}
      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {currentUser.id === 1 ? '👤' : '💕'} Your Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(userTotal)}</div>
            {currentUser.budgetCap && (
              <>
                <div className="text-sm text-gray-600 mt-1">
                  of {formatCurrency(currentUser.budgetCap)} budget ({userBudgetPercentage.toFixed(0)}%) {userStatus.emoji}
                </div>
                <Progress value={Math.min(userBudgetPercentage, 100)} className="mt-2" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {otherUser?.id === 1 ? '👤' : '💕'} {otherUser?.name}&apos;s Monthly Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(otherUserTotal)}</div>
            {otherUser?.budgetCap && (
              <>
                <div className="text-sm text-gray-600 mt-1">
                  of {formatCurrency(otherUser.budgetCap)} budget ({otherUserBudgetPercentage.toFixed(0)}%) {otherUserStatus.emoji}
                </div>
                <Progress value={Math.min(otherUserBudgetPercentage, 100)} className="mt-2" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Combined and Shared */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">📊 Combined Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(combinedTotal)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">🤝 Shared Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(sharedTotal)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
