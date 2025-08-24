export interface User {
  id: number;
  name: string;
  budgetCap?: number;
}

export interface Category {
  id: number;
  name: string;
  emoji: string;
  color: string;
}

export interface Spending {
  id: number;
  userId: number;
  title: string;
  amount: number;
  categoryId: number;
  notes?: string;
  date: string;
  isShared: boolean;
}

export interface SpendingWithDetails extends Spending {
  userName: string;
  categoryName: string;
  categoryEmoji: string;
  categoryColor: string;
}

export interface IOU {
  id: number;
  fromUserId: number;
  toUserId: number;
  title: string;
  amount: number;
  categoryId: number;
  notes?: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface IOUWithDetails extends IOU {
  fromUserName: string;
  toUserName: string;
  categoryName: string;
  categoryEmoji: string;
  categoryColor: string;
}
