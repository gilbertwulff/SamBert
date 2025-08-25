'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { addSpending, addSharedSpending } from '@/lib/api';
import { STATIC_CATEGORIES } from '@/lib/static-categories';
import { User, Category } from '@/lib/types';
import { Spinner } from '@/components/ui/spinner';

interface AddExpenseDialogProps {
  currentUser: User;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExpenseAdded: () => void;
}

export default function AddExpenseDialog({ 
  currentUser, 
  isOpen, 
  onOpenChange, 
  onExpenseAdded 
}: AddExpenseDialogProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [notes, setNotes] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use static categories instead of loading from database
  const categories = STATIC_CATEGORIES;
  const quickCategories = categories.slice(0, 3); // Food, Grocery, Online Shopping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !amount || !selectedCategory) {
      return;
    }

    setIsSubmitting(true);

    try {
      const amountNum = parseFloat(amount);
      const date = new Date().toISOString();

      if (isShared) {
        await addSharedSpending(title.trim(), amountNum, selectedCategory.id, notes.trim() || undefined, currentUser.id);
      } else {
        await addSpending({
          userId: currentUser.id,
          title: title.trim(),
          amount: amountNum,
          categoryId: selectedCategory.id,
          notes: notes.trim() || undefined,
          date,
          isShared: false
        });
      }

      // Reset form
      setTitle('');
      setAmount('');
      setSelectedCategory(null);
      setNotes('');
      setIsShared(false);
      setShowNotes(false);
      
      onExpenseAdded();
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to add expense:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>➕ Add New Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Lunch at cafe"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Amount (RM) *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Category *</label>
            
            {/* All Categories Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  type="button"
                  variant={selectedCategory?.id === category.id ? "default" : "outline"}
                  className="h-12 text-sm sm:text-sm px-2"
                  onClick={() => setSelectedCategory(category)}
                >
                  <span className="mr-1">{category.emoji}</span>
                  <span className="truncate">{category.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Split Expense Toggle */}
          <div className="flex items-center justify-between mt-6">
            <label className="text-sm font-medium">🤝 Split Expense</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsShared(!isShared)}
              className={isShared ? "bg-green-600 text-white hover:bg-green-700" : ""}
            >
              Split
            </Button>
          </div>

          {/* Notes Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Notes</label>
            <Button
              type="button"
              variant={showNotes ? "default" : "outline"}
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
            >
              {showNotes ? "Hide" : "Show"}
            </Button>
          </div>

          {showNotes && (
            <div>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!title.trim() || !amount || !selectedCategory || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Adding...
                </>
              ) : (
                'Add Expense'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
