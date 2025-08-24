import { User } from './types';

const CURRENT_USER_KEY = 'sambert_current_user';

export const setCurrentUser = (user: User): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }
};

export const getCurrentUser = (): User | null => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem(CURRENT_USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const clearCurrentUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
