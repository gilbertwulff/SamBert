// Re-export all functions from the API wrapper for client-side use
export {
  getUsers,
  getUserById,
  updateUserBudget,
  getCategories,
  addCategory,
  getSpendingsWithDetails,
  addSpending,
  addSharedSpending,
  getMonthlyTotal,
  getCombinedMonthlyTotal,
  getSharedExpensesTotal,
  getCategoryBreakdown,
  getIOUsWithDetails,
  addIOU,
  updateIOUStatus,
  getIOUsForUser,
  deleteSpending,
  deleteIOU
} from './api';
