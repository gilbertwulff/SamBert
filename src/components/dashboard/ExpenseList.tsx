'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getSpendingsWithDetails, deleteSpending } from '@/lib/db';
import { User, SpendingWithDetails } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface ExpenseListProps {
  currentUser: User;
  currentMonth: number;
  currentYear: number;
  viewMode: 'individual' | 'combined' | 'shared';
  title?: string;
  limit?: number;
  showViewMore?: boolean;
  onViewMore?: () => void;
  showDeleteButton?: boolean;
}

export default function ExpenseList({ 
  currentUser, 
  currentMonth, 
  currentYear, 
  viewMode, 
  title,
  limit,
  showViewMore = false,
  onViewMore,
  showDeleteButton = false
}: ExpenseListProps) {
  const [showAll, setShowAll] = useState(false);
  const [expenses, setExpenses] = useState<SpendingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<SpendingWithDetails | null>(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        let allExpenses = await getSpendingsWithDetails();
        
        // Filter by date
        allExpenses = allExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === currentYear;
        });

        // Filter by view mode
        if (viewMode === 'individual') {
          allExpenses = allExpenses.filter(expense => expense.userId === currentUser.id);
        } else if (viewMode === 'shared') {
          allExpenses = allExpenses.filter(expense => expense.isShared);
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
  }, [currentUser.id, currentMonth, currentYear, viewMode]);

  const handleDeleteClick = (expense: SpendingWithDetails) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    
    try {
      await deleteSpending(expenseToDelete.id);
      // Refresh the list
      const allExpenses = await getSpendingsWithDetails();
      let filteredExpenses = allExpenses;

      // Filter by date
      filteredExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      });

      // Filter by view mode
      if (viewMode === 'individual') {
        filteredExpenses = filteredExpenses.filter(expense => expense.userId === currentUser.id);
      } else if (viewMode === 'shared') {
        filteredExpenses = filteredExpenses.filter(expense => expense.isShared);
      }

      // Sort by date (newest first)
      filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setExpenses(filteredExpenses);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const maxItems = limit || 5;
  const displayedExpenses = showAll ? expenses : expenses.slice(0, maxItems);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title || '📝 Recent Expenses'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Loading expenses...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title || '📝 Recent Expenses'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No expenses recorded yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title || '📝 Recent Expenses'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedExpenses.map((expense) => (
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
              {showDeleteButton ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(expense.amount)}</div>
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
              ) : (
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(expense.amount)}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {showViewMore && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={onViewMore}
            >
              {expenses.length > maxItems ? `View More (${expenses.length - maxItems} more)` : 'View More'}
            </Button>
          </div>
        )}

        {!showViewMore && expenses.length > maxItems && (
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All (${expenses.length})`}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{expenseToDelete?.title}&quot;? This action cannot be undone.
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
    </Card>
  );
}
