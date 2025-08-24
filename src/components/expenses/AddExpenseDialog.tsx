'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getCategories, addSpending, addSharedSpending } from '@/lib/db';
import { User, Category } from '@/lib/types';

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

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const quickCategories = categories.slice(0, 3); // Food, Grocery, Online Shopping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !amount || !selectedCategory) {
      return;
    }

    try {
      const amountNum = parseFloat(amount);
      const date = new Date().toISOString();

      if (isShared) {
        await addSharedSpending(title.trim(), amountNum, selectedCategory.id, notes.trim() || undefined);
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
            
            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Loading categories...
              </div>
            ) : (
              <>
                {/* Quick Category Buttons */}
                <div className="flex gap-2 mt-2 mb-3">
                  {quickCategories.map((category) => {
                    const contentLength = category.emoji.length + category.name.length;
                    const flexBasis = Math.max(contentLength * 8, 80); // Minimum 80px, 8px per character
                    return (
                      <Button
                        key={category.id}
                        type="button"
                        variant={selectedCategory?.id === category.id ? "default" : "outline"}
                        className="h-12"
                        style={{ flexBasis: `${flexBasis}px`, flexGrow: 0, flexShrink: 0 }}
                        onClick={() => setSelectedCategory(category)}
                      >
                        <span className="mr-1">{category.emoji}</span>
                        {category.name}
                      </Button>
                    );
                  })}
            </div>

            {/* All Categories Grid */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {categories.slice(3).map((category) => (
                                        <Button
                          key={category.id}
                          type="button"
                          variant={selectedCategory?.id === category.id ? "default" : "outline"}
                          className="h-12 text-sm"
                          onClick={() => setSelectedCategory(category)}
                        >
                          <span className="mr-1">{category.emoji}</span>
                          {category.name}
                        </Button>
              ))}
            </div>


              </>
            )}
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
              disabled={!title.trim() || !amount || !selectedCategory}
            >
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
