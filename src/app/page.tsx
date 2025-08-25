'use client';

import { useState, useEffect } from 'react';
import UserSelector from '@/components/auth/UserSelector';
import Header from '@/components/layout/Header';
import HomePage from '@/components/home/HomePage';
import DashboardPage from '@/components/dashboard/DashboardPage';
import SettingsPage from '@/components/settings/SettingsPage';
import TransactionsPage from '@/components/transactions/TransactionsPage';
import PinjamPage from '@/components/pinjam/PinjamPage';
import BottomNavigation from '@/components/layout/BottomNavigation';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import AddExpenseDialog from '@/components/expenses/AddExpenseDialog';
import { getCurrentUser } from '@/lib/auth';
import { User } from '@/lib/types';

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'dashboard' | 'ious' | 'settings' | 'transactions'>('home');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  const handleUserSelected = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleExpenseAdded = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleBudgetUpdated = async () => {
    try {
      // Fetch updated user data from the database
      const response = await fetch('/api/users');
      if (response.ok) {
        const users = await response.json();
        const updatedUser = users.find((user: User) => user.id === currentUser?.id);
        if (updatedUser) {
          // Update both the state and localStorage
          setCurrentUser(updatedUser);
          localStorage.setItem('sambert_current_user', JSON.stringify(updatedUser));
        }
      }
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const handleViewAllTransactions = () => {
    setCurrentPage('transactions');
  };

  if (!currentUser) {
    return <UserSelector onUserSelected={handleUserSelected} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} />
      
      <div className="relative">
        <div key={refreshKey} className="pb-16">
          {currentPage === 'home' && (
            <HomePage 
              currentUser={currentUser} 
              onViewAllTransactions={handleViewAllTransactions}
            />
          )}
          {currentPage === 'dashboard' && (
            <DashboardPage currentUser={currentUser} />
          )}
          {currentPage === 'ious' && (
            <PinjamPage currentUser={currentUser} />
          )}
          {currentPage === 'settings' && (
            <SettingsPage 
              currentUser={currentUser} 
              onBudgetUpdated={handleBudgetUpdated}
            />
          )}
          {currentPage === 'transactions' && (
            <TransactionsPage 
              currentUser={currentUser} 
              onBack={() => setCurrentPage('home')}
            />
          )}
        </div>
      </div>

      <BottomNavigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
      />

      {currentPage !== 'settings' && currentPage !== 'transactions' && (
        <FloatingActionButton onClick={() => setIsAddExpenseOpen(true)} />
      )}
      
      <AddExpenseDialog
        currentUser={currentUser}
        isOpen={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        onExpenseAdded={handleExpenseAdded}
      />
    </div>
  );
}