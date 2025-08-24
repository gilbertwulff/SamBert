import { User } from './types';

// Hardcoded users - no database needed for user selection
export const STATIC_USERS: User[] = [
  { id: 1, name: 'Bert', budgetCap: 3000 },
  { id: 2, name: 'Sam', budgetCap: 3000 }
];

export function getStaticUsers(): User[] {
  return STATIC_USERS;
}

export function getStaticUserById(id: number): User | undefined {
  return STATIC_USERS.find(user => user.id === id);
}

export function updateStaticUserBudget(userId: number, budgetCap: number): User | undefined {
  const user = STATIC_USERS.find(u => u.id === userId);
  if (user) {
    user.budgetCap = budgetCap;
  }
  return user;
}
