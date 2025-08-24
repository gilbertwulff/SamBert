import { User, Category, Spending, SpendingWithDetails, IOU, IOUWithDetails } from './types';

// API wrapper functions for client-side use

export const getUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const getUserById = async (id: number): Promise<User | undefined> => {
  const users = await getUsers();
  return users.find(user => user.id === id);
};

export const updateUserBudget = async (userId: number, budgetCap: number): Promise<User> => {
  const response = await fetch('/api/users', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, budgetCap })
  });
  if (!response.ok) throw new Error('Failed to update user budget');
  return response.json();
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch('/api/categories');
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
};

export const addCategory = async (name: string, emoji: string, color?: string): Promise<Category> => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, emoji, color })
  });
  if (!response.ok) throw new Error('Failed to add category');
  return response.json();
};

export const getSpendingsWithDetails = async (): Promise<SpendingWithDetails[]> => {
  const response = await fetch('/api/spendings');
  if (!response.ok) throw new Error('Failed to fetch spendings');
  return response.json();
};

export const addSpending = async (spending: Omit<Spending, 'id'>): Promise<Spending> => {
  const response = await fetch('/api/spendings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(spending)
  });
  if (!response.ok) throw new Error('Failed to add spending');
  return response.json();
};

export const addSharedSpending = async (
  title: string,
  amount: number,
  categoryId: number,
  notes?: string
): Promise<Spending[]> => {
  const response = await fetch('/api/spendings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, amount, categoryId, notes, isShared: true })
  });
  if (!response.ok) throw new Error('Failed to add shared spending');
  return response.json();
};

export const getMonthlyTotal = async (userId: number, month: number, year: number): Promise<number> => {
  const response = await fetch(`/api/analytics?type=monthly&userId=${userId}&month=${month}&year=${year}`);
  if (!response.ok) throw new Error('Failed to fetch monthly total');
  const data = await response.json();
  return data.total;
};

export const getCombinedMonthlyTotal = async (month: number, year: number): Promise<number> => {
  const response = await fetch(`/api/analytics?type=combined&month=${month}&year=${year}`);
  if (!response.ok) throw new Error('Failed to fetch combined total');
  const data = await response.json();
  return data.total;
};

export const getSharedExpensesTotal = async (month: number, year: number): Promise<number> => {
  const response = await fetch(`/api/analytics?type=shared&month=${month}&year=${year}`);
  if (!response.ok) throw new Error('Failed to fetch shared expenses total');
  const data = await response.json();
  return data.total;
};

export const getCategoryBreakdown = async (userId?: number, month?: number, year?: number) => {
  const params = new URLSearchParams({ type: 'category' });
  if (userId) params.append('userId', userId.toString());
  if (month !== undefined) params.append('month', month.toString());
  if (year !== undefined) params.append('year', year.toString());
  
  const response = await fetch(`/api/analytics?${params}`);
  if (!response.ok) throw new Error('Failed to fetch category breakdown');
  return response.json();
};

// IOU functions
export const getIOUsWithDetails = async (): Promise<IOUWithDetails[]> => {
  const response = await fetch('/api/ious');
  if (!response.ok) throw new Error('Failed to fetch IOUs');
  return response.json();
};

export const addIOU = async (iou: Omit<IOU, 'id'>): Promise<IOU> => {
  const response = await fetch('/api/ious', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(iou)
  });
  if (!response.ok) throw new Error('Failed to add IOU');
  return response.json();
};

export const updateIOUStatus = async (iouId: number, status: 'approved' | 'rejected'): Promise<void> => {
  const response = await fetch('/api/ious', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ iouId, status })
  });
  if (!response.ok) throw new Error('Failed to update IOU status');
};

export const getIOUsForUser = async (userId: number, type: 'sent' | 'received'): Promise<IOUWithDetails[]> => {
  const allIOUs = await getIOUsWithDetails();
  if (type === 'sent') {
    return allIOUs.filter(iou => iou.fromUserId === userId);
  } else {
    return allIOUs.filter(iou => iou.toUserId === userId);
  }
};

// Delete functions
export const deleteSpending = async (spendingId: number): Promise<void> => {
  const response = await fetch('/api/spendings', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ spendingId })
  });
  if (!response.ok) throw new Error('Failed to delete spending');
};

export const deleteIOU = async (iouId: number): Promise<void> => {
  const response = await fetch('/api/ious', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ iouId })
  });
  if (!response.ok) throw new Error('Failed to delete IOU');
};
