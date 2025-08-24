'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateUserBudget } from '@/lib/db';
import { User } from '@/lib/types';
import { Settings } from 'lucide-react';

interface BudgetSettingsProps {
  currentUser: User;
  onBudgetUpdated: () => void;
}

export default function BudgetSettings({ currentUser, onBudgetUpdated }: BudgetSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [budgetAmount, setBudgetAmount] = useState(
    currentUser.budgetCap?.toString() || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(budgetAmount);
    if (amount > 0) {
      updateUserBudget(currentUser.id, amount);
      onBudgetUpdated();
      setIsOpen(false);
    }
  };

  const handleRemoveBudget = () => {
    updateUserBudget(currentUser.id, 0);
    setBudgetAmount('');
    onBudgetUpdated();
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="absolute top-4 left-4"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>🎯 Budget Settings</DialogTitle>
          </DialogHeader>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                {currentUser.id === 1 ? '👤' : '💕'} {currentUser.name}&apos;s Monthly Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Budget Amount (RM)</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="3000.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Set your monthly spending limit to track progress
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

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </form>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
