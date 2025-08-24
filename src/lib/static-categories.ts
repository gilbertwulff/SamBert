import { Category } from './types';

// Hardcoded categories as fallback when Postgres isn't available
export const STATIC_CATEGORIES: Category[] = [
  { id: 1, name: 'Food', emoji: '🍔', color: '#EF4444' },
  { id: 2, name: 'Grocery', emoji: '🛒', color: '#10B981' },
  { id: 3, name: 'Online Shopping', emoji: '📦', color: '#3B82F6' },
  { id: 4, name: 'Transport', emoji: '🚗', color: '#F59E0B' },
  { id: 5, name: 'Entertainment', emoji: '🎬', color: '#8B5CF6' },
  { id: 6, name: 'Bills', emoji: '💡', color: '#6B7280' }
];

export function getStaticCategories(): Category[] {
  return STATIC_CATEGORIES;
}

export function getStaticCategoryById(id: number): Category | undefined {
  return STATIC_CATEGORIES.find(category => category.id === id);
}

