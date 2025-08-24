// In-memory storage for Vercel deployment
// This provides a working app without database dependencies

import { User, Category, Spending, IOU } from './types';

// Static data that always exists
export const VERCEL_USERS: User[] = [
  { id: 1, name: 'Bert', budgetCap: 3000 },
  { id: 2, name: 'Sam', budgetCap: 3000 }
];

export const VERCEL_CATEGORIES: Category[] = [
  { id: 1, name: 'Food', emoji: '🍔', color: '#EF4444' },
  { id: 2, name: 'Grocery', emoji: '🛒', color: '#10B981' },
  { id: 3, name: 'Online Shopping', emoji: '📦', color: '#3B82F6' },
  { id: 4, name: 'Transport', emoji: '🚗', color: '#F59E0B' },
  { id: 5, name: 'Entertainment', emoji: '🎬', color: '#8B5CF6' },
  { id: 6, name: 'Bills', emoji: '💡', color: '#6B7280' }
];

// Simple in-memory storage (resets on each deployment)
const memoryUsers = [...VERCEL_USERS];
const memoryCategories = [...VERCEL_CATEGORIES];
let memorySpendings: Spending[] = [];
let memoryIOUs: IOU[] = [];
let nextSpendingId = 1;
let nextIOUId = 1;

export const VercelStorage = {
  // Users
  getUsers: () => [...memoryUsers],
  getUserById: (id: number) => memoryUsers.find(u => u.id === id),
  updateUserBudget: (userId: number, budgetCap: number) => {
    const user = memoryUsers.find(u => u.id === userId);
    if (user) {
      user.budgetCap = budgetCap;
    }
  },

  // Categories
  getCategories: () => [...memoryCategories],
  addCategory: (name: string, emoji: string, color: string = '#6B7280') => {
    const newCategory = {
      id: memoryCategories.length + 1,
      name,
      emoji,
      color
    };
    memoryCategories.push(newCategory);
    return newCategory;
  },

  // Spendings
  getSpendings: () => [...memorySpendings].reverse(), // Most recent first
  addSpending: (spending: Omit<Spending, 'id'>) => {
    const newSpending = {
      ...spending,
      id: nextSpendingId++,
      date: new Date().toISOString()
    };
    memorySpendings.push(newSpending);
    return newSpending;
  },
  deleteSpending: (id: number) => {
    memorySpendings = memorySpendings.filter(s => s.id !== id);
  },

  // IOUs
  getIOUs: () => [...memoryIOUs].reverse(), // Most recent first
  addIOU: (iou: Omit<IOU, 'id'>) => {
    const newIOU = {
      ...iou,
      id: nextIOUId++,
      date: new Date().toISOString(),
      status: 'pending' as const
    };
    memoryIOUs.push(newIOU);
    return newIOU;
  },
  updateIOUStatus: (id: number, status: 'pending' | 'approved' | 'rejected') => {
    const iou = memoryIOUs.find(i => i.id === id);
    if (iou) {
      iou.status = status;
      
      // If approved, convert to spending
      if (status === 'approved') {
        const spending = {
          userId: iou.toUserId,
          title: `💕 ${iou.title}`,
          amount: iou.amount,
          categoryId: iou.categoryId,
          notes: iou.notes || '',
          date: new Date().toISOString(),
          isShared: false
        };
        return VercelStorage.addSpending(spending);
      }
    }
  },
  deleteIOU: (id: number) => {
    memoryIOUs = memoryIOUs.filter(i => i.id !== id);
  },

  // Analytics
  getMonthlyTotal: (userId: number, month: number, year: number) => {
    return memorySpendings
      .filter(s => {
        const spendingDate = new Date(s.date);
        return s.userId === userId && 
               spendingDate.getMonth() === month && 
               spendingDate.getFullYear() === year;
      })
      .reduce((total, s) => total + s.amount, 0);
  },

  getCombinedMonthlyTotal: (month: number, year: number) => {
    return memorySpendings
      .filter(s => {
        const spendingDate = new Date(s.date);
        return spendingDate.getMonth() === month && 
               spendingDate.getFullYear() === year;
      })
      .reduce((total, s) => total + s.amount, 0);
  },

  getSharedExpensesTotal: (month: number, year: number) => {
    return memorySpendings
      .filter(s => {
        const spendingDate = new Date(s.date);
        return s.isShared && 
               spendingDate.getMonth() === month && 
               spendingDate.getFullYear() === year;
      })
      .reduce((total, s) => total + (s.amount * 2), 0); // Double for shared
  },

  getCategoryBreakdown: (userId: number, month: number, year: number) => {
    const userSpendings = memorySpendings.filter(s => {
      const spendingDate = new Date(s.date);
      return s.userId === userId && 
             spendingDate.getMonth() === month && 
             spendingDate.getFullYear() === year;
    });

    const breakdown: { [key: string]: number } = {};
    userSpendings.forEach(s => {
      const category = memoryCategories.find(c => c.id === s.categoryId);
      if (category) {
        breakdown[category.name] = (breakdown[category.name] || 0) + s.amount;
      }
    });

    return Object.entries(breakdown).map(([name, value]) => {
      const category = memoryCategories.find(c => c.name === name);
      return {
        name,
        value,
        emoji: category?.emoji || '📊'
      };
    });
  }
};
