'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { updateUserBudget, getUsers, getMonthlyTotal } from '@/lib/db';
import { User } from '@/lib/types';

interface SettingsPageProps {
  currentUser: User;
  onBudgetUpdated: () => void;
}

interface UserProfileCardProps {
  user: User;
  currentUser: User;
  currentMonth: number;
  currentYear: number;
  formatCurrency: (amount: number) => string;
}

const UserProfileCard = ({ user, currentUser, currentMonth, currentYear, formatCurrency }: UserProfileCardProps) => {
  const [userTotal, setUserTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserTotal = async () => {
      try {
        const total = await getMonthlyTotal(user.id, currentMonth, currentYear);
        setUserTotal(total);
      } catch (error) {
        console.error('Failed to fetch user total:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserTotal();
  }, [user.id, currentMonth, currentYear]);

  const isCurrentUser = user.id === currentUser.id;

  return (
    <div 
      className={`p-4 rounded-lg border ${isCurrentUser ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-xl">
            {user.id === 1 ? '👤' : '💕'}
          </span>
          <span className="font-medium">{user.name}</span>
          {isCurrentUser && (
            <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
              You
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">This month:</span>
          <span className="font-medium">
            {loading ? 'Loading...' : formatCurrency(userTotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Budget:</span>
          <span className="font-medium">
            {user.budgetCap ? formatCurrency(user.budgetCap) : 'Not set'}
          </span>
        </div>
        {user.budgetCap && !loading && (
          <div className="flex justify-between">
            <span className="text-gray-600">Progress:</span>
            <span className="font-medium">
              {((userTotal / user.budgetCap) * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function SettingsPage({ currentUser, onBudgetUpdated }: SettingsPageProps) {
  const [budgetAmount, setBudgetAmount] = useState(
    currentUser.budgetCap?.toString() || ''
  );
  
  // Update budget amount when currentUser changes
  useEffect(() => {
    setBudgetAmount(currentUser.budgetCap?.toString() || '');
  }, [currentUser.budgetCap]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState('');
  

  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const amount = parseFloat(budgetAmount);
      if (amount > 0) {
        console.log('Updating budget for user', currentUser.id, 'to', amount);
        const updatedUser = await updateUserBudget(currentUser.id, amount);
        console.log('Budget updated successfully:', updatedUser);
        onBudgetUpdated();
      }
    } catch (error) {
      console.error('Failed to update budget:', error);
      alert('Failed to update budget. Please try again.');
    }
  };

  const handleRemoveBudget = async () => {
    try {
      await updateUserBudget(currentUser.id, 0);
      setBudgetAmount('');
      onBudgetUpdated();
    } catch (error) {
      console.error('Failed to remove budget:', error);
    }
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    setSeedMessage('');
    
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSeedMessage(`✅ Success! ${result.data.userCount} users and ${result.data.categoryCount} categories created.`);
        // Refresh users list
        const fetchUsers = async () => {
          try {
            const usersData = await getUsers();
            setUsers(usersData);
          } catch (error) {
            console.error('Failed to fetch users:', error);
          }
        };
        fetchUsers();
      } else {
        setSeedMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setSeedMessage('❌ Failed to seed database');
      console.error('Seed error:', error);
    } finally {
      setSeedLoading(false);
    }
  };

  const handleCheckDatabase = async () => {
    setSeedLoading(true);
    setSeedMessage('');
    
    try {
      const response = await fetch('/api/seed', {
        method: 'GET',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setSeedMessage(`📊 Database status: ${result.data.userCount} users, ${result.data.categoryCount} categories`);
      } else {
        setSeedMessage(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setSeedMessage('❌ Failed to check database');
      console.error('Database check error:', error);
    } finally {
      setSeedLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `RM${amount.toFixed(2)}`;

  const getMonthName = (month: number) => {
    return new Date(2024, month).toLocaleDateString('en-US', { month: 'long' });
  };



  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      <div className="p-4 space-y-6">
        {/* Settings Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold">⚙️ Settings</h2>
          <p className="text-gray-600">Manage your profile and preferences</p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">👤 Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="text-center text-gray-500 py-4">
                Loading profiles...
              </div>
            ) : (
              users.map((user) => (
                <UserProfileCard
                  key={user.id}
                  user={user}
                  currentUser={currentUser}
                  currentMonth={currentMonth}
                  currentYear={currentYear}
                  formatCurrency={formatCurrency}
                />
              ))
            )}
          </CardContent>
        </Card>

        {/* Budget Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🎯 Budget Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span>{currentUser.id === 1 ? '👤' : '💕'}</span>
                  <span className="font-medium">{currentUser.name}&apos;s Monthly Budget</span>
                </div>
                
                <form onSubmit={handleBudgetSubmit} className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Budget Amount (RM)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={budgetAmount}
                      onChange={(e) => setBudgetAmount(e.target.value)}
                      placeholder="3000.00"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Set your monthly spending limit for {getMonthName(currentMonth)}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!budgetAmount || parseFloat(budgetAmount) <= 0}
                    >
                      {currentUser.budgetCap ? 'Update' : 'Set'} Budget
                    </Button>
                    
                    {currentUser.budgetCap && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleRemoveBudget}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Database Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🗄️ Database Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Use these tools to manage the database on your deployed app.
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCheckDatabase}
                disabled={seedLoading}
                variant="outline"
                className="flex-1"
              >
                {seedLoading ? 'Checking...' : 'Check Database'}
              </Button>
              
              <Button
                onClick={handleSeedDatabase}
                disabled={seedLoading}
                className="flex-1"
              >
                {seedLoading ? 'Seeding...' : 'Reset & Seed Database'}
              </Button>
            </div>
            
            {seedMessage && (
              <div className="p-2 bg-gray-50 rounded text-sm">
                {seedMessage}
              </div>
            )}
            
            <div className="text-xs text-gray-500">
              <strong>Check Database:</strong> View current users and categories<br/>
              <strong>Reset & Seed:</strong> Clear all data and add Bert & Sam with default categories
            </div>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ℹ️ App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">App Name:</span>
              <span>SamBert</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Version:</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current Month:</span>
              <span>{getMonthName(currentMonth)} {currentYear}</span>
            </div>
          </CardContent>
        </Card>

        {/* Bottom padding for navigation */}
        <div className="h-20"></div>
      </div>
    </div>
  );
}
