'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getSpendingsWithDetails, deleteSpending } from '@/lib/db';
import { User, SpendingWithDetails } from '@/lib/types';
import { ArrowLeft, Trash2 } from 'lucide-react';

interface TransactionsPageProps {
  currentUser: User;
  onBack: () => void;
}

export default function TransactionsPage({ currentUser, onBack }: TransactionsPageProps) {
  const [viewMode, setViewMode] = useState<'individual' | 'combined' | 'shared'>('individual');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [expenses, setExpenses] = useState<SpendingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<SpendingWithDetails | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        let allExpenses = await getSpendingsWithDetails();
        
        // Filter by view mode
        if (viewMode === 'individual') {
          allExpenses = allExpenses.filter(expense => expense.userId === currentUser.id);
        } else if (viewMode === 'shared') {
          allExpenses = allExpenses.filter(expense => expense.isShared);
        }
        
        // Filter by selected month/year if not showing all
        if (selectedMonth !== -1) {
          allExpenses = allExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === selectedMonth && 
                   expenseDate.getFullYear() === selectedYear;
          });
        }

        // Sort by date (newest first)
        allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setExpenses(allExpenses);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
        setExpenses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [currentUser.id, viewMode, selectedMonth, selectedYear]);

  const handleDeleteClick = (expense: SpendingWithDetails) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    
    try {
      await deleteSpending(expenseToDelete.id);
      // Refresh the list
      let allExpenses = await getSpendingsWithDetails();
      
      // Filter by view mode
      if (viewMode === 'individual') {
        allExpenses = allExpenses.filter(expense => expense.userId === currentUser.id);
      } else if (viewMode === 'shared') {
        allExpenses = allExpenses.filter(expense => expense.isShared);
      }
      
      // Filter by selected month/year if not showing all
      if (selectedMonth !== -1) {
        allExpenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === selectedMonth && 
                 expenseDate.getFullYear() === selectedYear;
        });
      }

      // Sort by date (newest first)
      allExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setExpenses(allExpenses);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => `RM${amount.toFixed(2)}`;

  const getMonthName = (month: number) => {
    if (month === -1) return 'All Time';
    return new Date(2024, month).toLocaleDateString('en-US', { month: 'long' });
  };

  const months = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">📋 All Transactions</h2>
            <p className="text-gray-600">Complete transaction history</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* View Mode Toggle */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">View Mode</label>
              <div className="flex space-x-2">
                <Button
                  variant={viewMode === 'individual' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setViewMode('individual')}
                >
                  👤
                </Button>
                <Button
                  variant={viewMode === 'combined' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setViewMode('combined')}
                >
                  📊
                </Button>
                <Button
                  variant={viewMode === 'shared' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setViewMode('shared')}
                >
                  🤝
                </Button>
              </div>
            </div>

            {/* Month Filter */}
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Filter by Month</label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  variant={selectedMonth === -1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedMonth(-1)}
                  className="text-xs"
                >
                  All
                </Button>
                {months.map((month) => (
                  <Button
                    key={month}
                    variant={selectedMonth === month ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMonth(month)}
                    className="text-xs"
                  >
                    {new Date(2024, month).toLocaleDateString('en-US', { month: 'short' })}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Count */}
        <div className="text-center">
          <p className="text-gray-600">
            Showing {expenses.length} transactions for {getMonthName(selectedMonth)} {selectedYear}
          </p>
        </div>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500 py-8">
                Loading transactions...
              </div>
            ) : expenses.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No transactions found for the selected filters
              </div>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg relative"
                  >
                    {/* Color bar on the left */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                      style={{ backgroundColor: expense.categoryColor }}
                    ></div>
                    
                    <div className="flex items-center space-x-3 ml-3">
                      <div className="text-xl">{expense.categoryEmoji}</div>
                      <div>
                        <div className="font-medium">{expense.title}</div>
                        <div className="text-sm text-gray-500">
                          {formatDate(expense.date)}
                          {viewMode !== 'individual' && (
                            <span className="ml-2">
                              • {expense.userName}
                              {expense.isShared && ' 🤝'}
                            </span>
                          )}
                        </div>
                        {expense.notes && (
                          <div className="text-xs text-gray-400 mt-1">{expense.notes}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(expense.amount)}</div>
                        <div className="text-xs text-gray-500">{expense.categoryName}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClick(expense)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        title="Delete expense"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom padding for navigation */}
        <div className="h-20"></div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Expense</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{expenseToDelete?.title}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDeleteConfirm}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
