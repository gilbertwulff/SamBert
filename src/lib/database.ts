import Database from 'better-sqlite3';
import path from 'path';
import { User, Category, Spending, SpendingWithDetails, IOU, IOUWithDetails } from './types';

// Initialize database
const dbPath = path.join(process.cwd(), 'sambert.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
const initDB = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      budget_cap REAL
    )
  `);

  // Categories table
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6B7280'
    )
  `);

  // Spendings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS spendings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      notes TEXT,
      date TEXT NOT NULL,
      is_shared BOOLEAN NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);

  // IOUs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ious (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      notes TEXT,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (from_user_id) REFERENCES users (id),
      FOREIGN KEY (to_user_id) REFERENCES users (id),
      FOREIGN KEY (category_id) REFERENCES categories (id)
    )
  `);
};

// Seed initial data
const seedData = () => {
  // Check if data already exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  
  if (userCount.count === 0) {
    // Insert users
    const insertUser = db.prepare('INSERT INTO users (name, budget_cap) VALUES (?, ?)');
    insertUser.run('Bert', 3000);
    insertUser.run('Sam', 3000);

    // Insert categories with colors
    const insertCategory = db.prepare('INSERT INTO categories (name, emoji, color) VALUES (?, ?, ?)');
    insertCategory.run('Food', '🍔', '#EF4444'); // Red
    insertCategory.run('Grocery', '🛒', '#10B981'); // Green
    insertCategory.run('Online Shopping', '📦', '#3B82F6'); // Blue
    insertCategory.run('Transport', '🚗', '#F59E0B'); // Yellow
    insertCategory.run('Entertainment', '🎬', '#8B5CF6'); // Purple
    insertCategory.run('Bills', '💡', '#6B7280'); // Gray

    // No sample data - start with clean database for production
    console.log('Database initialized with users and categories, ready for production');
  }
};

// Initialize database and seed data
initDB();
seedData();

// Database functions
export const getUsers = (): User[] => {
  const stmt = db.prepare('SELECT * FROM users');
  return stmt.all() as User[];
};

export const getUserById = (id: number): User | undefined => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
};

export const updateUserBudget = (userId: number, budgetCap: number): void => {
  const stmt = db.prepare('UPDATE users SET budget_cap = ? WHERE id = ?');
  stmt.run(budgetCap, userId);
};

export const getCategories = (): Category[] => {
  const stmt = db.prepare('SELECT * FROM categories');
  return stmt.all() as Category[];
};

export const addCategory = (name: string, emoji: string, color: string = '#6B7280'): Category => {
  const stmt = db.prepare('INSERT INTO categories (name, emoji, color) VALUES (?, ?, ?) RETURNING *');
  return stmt.get(name, emoji, color) as Category;
};

export const getSpendings = (): Spending[] => {
  const stmt = db.prepare('SELECT * FROM spendings ORDER BY date DESC');
  return (stmt.all() as Record<string, unknown>[]).map((row: Record<string, unknown>) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: row.amount,
    categoryId: row.category_id,
    notes: row.notes,
    date: row.date,
    isShared: Boolean(row.is_shared)
  })) as Spending[];
};

export const getSpendingsWithDetails = (): SpendingWithDetails[] => {
  const stmt = db.prepare(`
    SELECT 
      s.*,
      u.name as user_name,
      c.name as category_name,
      c.emoji as category_emoji,
      c.color as category_color
    FROM spendings s
    JOIN users u ON s.user_id = u.id
    JOIN categories c ON s.category_id = c.id
    ORDER BY s.date DESC
  `);
  
  return (stmt.all() as Record<string, unknown>[]).map((row: Record<string, unknown>) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    amount: row.amount,
    categoryId: row.category_id,
    notes: row.notes,
    date: row.date,
    isShared: Boolean(row.is_shared),
    userName: row.user_name,
    categoryName: row.category_name,
    categoryEmoji: row.category_emoji,
    categoryColor: row.category_color
  })) as SpendingWithDetails[];
};

export const addSpending = (spending: Omit<Spending, 'id'>): Spending => {
  const stmt = db.prepare(`
    INSERT INTO spendings (user_id, title, amount, category_id, notes, date, is_shared) 
    VALUES (?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `);
  
  const result = stmt.get(
    spending.userId,
    spending.title,
    spending.amount,
    spending.categoryId,
    spending.notes,
    spending.date,
    spending.isShared ? 1 : 0
  ) as Record<string, unknown>;
  
  return {
    id: result.id,
    userId: result.user_id,
    title: result.title,
    amount: result.amount,
    categoryId: result.category_id,
    notes: result.notes,
    date: result.date,
    isShared: Boolean(result.is_shared)
  } as Spending;
};

export const addSharedSpending = (
  title: string,
  amount: number,
  categoryId: number,
  notes?: string,
  payingUserId?: number
): Spending[] => {
  const date = new Date().toISOString();
  const amountPerPerson = amount / 2;
  
  // If payingUserId is specified, create expense for payer and IOU for the other person
  if (payingUserId) {
    const otherUserId = payingUserId === 1 ? 2 : 1;
    
    // Add expense for the person who paid
    const spending = addSpending({
      userId: payingUserId,
      title,
      amount: amountPerPerson,
      categoryId,
      notes,
      date,
      isShared: true
    });
    
    // Create IOU for the other person's half
    const insertIOU = db.prepare(`
      INSERT INTO ious (from_user_id, to_user_id, title, amount, category_id, notes, date, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insertIOU.run(otherUserId, payingUserId, `Split: ${title}`, amountPerPerson, categoryId, notes, date, 'pending');
    
    return [spending];
  } else {
    // Original logic: Add expense for both users (for backward compatibility)
    const spending1 = addSpending({
      userId: 1,
      title,
      amount: amountPerPerson,
      categoryId,
      notes,
      date,
      isShared: true
    });
    
    const spending2 = addSpending({
      userId: 2,
      title,
      amount: amountPerPerson,
      categoryId,
      notes,
      date,
      isShared: true
    });
    
    return [spending1, spending2];
  }
};

// Analytics functions
export const getMonthlyTotal = (userId: number, month: number, year: number): number => {
  const stmt = db.prepare(`
    SELECT SUM(amount) as total 
    FROM spendings 
    WHERE user_id = ? 
    AND strftime('%m', date) = ? 
    AND strftime('%Y', date) = ?
  `);
  
  const result = stmt.get(userId, String(month + 1).padStart(2, '0'), String(year)) as { total: number | null };
  return result.total || 0;
};

export const getCombinedMonthlyTotal = (month: number, year: number): number => {
  const stmt = db.prepare(`
    SELECT SUM(amount) as total 
    FROM spendings 
    WHERE strftime('%m', date) = ? 
    AND strftime('%Y', date) = ?
  `);
  
  const result = stmt.get(String(month + 1).padStart(2, '0'), String(year)) as { total: number | null };
  return result.total || 0;
};

export const getSharedExpensesTotal = (month: number, year: number): number => {
  const stmt = db.prepare(`
    SELECT s.title, s.date, s.amount
    FROM spendings s
    WHERE s.is_shared = 1
    AND strftime('%m', s.date) = ? 
    AND strftime('%Y', s.date) = ?
  `);
  
  const sharedSpendings = stmt.all(String(month + 1).padStart(2, '0'), String(year)) as { title: string; date: string; amount: number }[];
  
  // Avoid double counting - sum unique shared expenses
  const uniqueSharedExpenses = new Map();
  sharedSpendings.forEach(s => {
    const key = `${s.title}-${s.date}-${s.amount}`;
    if (!uniqueSharedExpenses.has(key)) {
      uniqueSharedExpenses.set(key, s.amount * 2); // Original amount before split
    }
  });
  
  return Array.from(uniqueSharedExpenses.values()).reduce((total, amount) => total + amount, 0);
};

export const getCategoryBreakdown = (userId?: number, month?: number, year?: number) => {
  let query = `
    SELECT 
      c.name,
      c.emoji,
      SUM(s.amount) as value
    FROM spendings s
    JOIN categories c ON s.category_id = c.id
    WHERE 1=1
  `;
  
  const params: (string | number)[] = [];
  
  if (userId) {
    query += ' AND s.user_id = ?';
    params.push(userId);
  }
  
  if (month !== undefined && year !== undefined) {
    query += ` AND strftime('%m', s.date) = ? AND strftime('%Y', s.date) = ?`;
    params.push(String(month + 1).padStart(2, '0'), String(year));
  }
  
  query += ' GROUP BY c.id, c.name, c.emoji HAVING value > 0';
  
  const stmt = db.prepare(query);
  return stmt.all(...params) as { name: string; emoji: string; value: number }[];
};

// IOU functions
export const getIOUs = (): IOU[] => {
  const stmt = db.prepare('SELECT * FROM ious ORDER BY date DESC');
  return (stmt.all() as Record<string, unknown>[]).map((row: Record<string, unknown>) => ({
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    title: row.title,
    amount: row.amount,
    categoryId: row.category_id,
    notes: row.notes,
    date: row.date,
    status: row.status
  })) as IOU[];
};

export const getIOUsWithDetails = (): IOUWithDetails[] => {
  const stmt = db.prepare(`
    SELECT 
      i.*,
      uf.name as from_user_name,
      ut.name as to_user_name,
      c.name as category_name,
      c.emoji as category_emoji
    FROM ious i
    JOIN users uf ON i.from_user_id = uf.id
    JOIN users ut ON i.to_user_id = ut.id
    JOIN categories c ON i.category_id = c.id
    ORDER BY i.date DESC
  `);
  
  return (stmt.all() as Record<string, unknown>[]).map((row: Record<string, unknown>) => ({
    id: row.id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    title: row.title,
    amount: row.amount,
    categoryId: row.category_id,
    notes: row.notes,
    date: row.date,
    status: row.status,
    fromUserName: row.from_user_name,
    toUserName: row.to_user_name,
    categoryName: row.category_name,
    categoryEmoji: row.category_emoji
  })) as IOUWithDetails[];
};

export const addIOU = (iou: Omit<IOU, 'id'>): IOU => {
  const stmt = db.prepare(`
    INSERT INTO ious (from_user_id, to_user_id, title, amount, category_id, notes, date, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
    RETURNING *
  `);
  
  const result = stmt.get(
    iou.fromUserId,
    iou.toUserId,
    iou.title,
    iou.amount,
    iou.categoryId,
    iou.notes,
    iou.date,
    iou.status
  ) as Record<string, unknown>;
  
  return {
    id: result.id,
    fromUserId: result.from_user_id,
    toUserId: result.to_user_id,
    title: result.title,
    amount: result.amount,
    categoryId: result.category_id,
    notes: result.notes,
    date: result.date,
    status: result.status
  } as IOU;
};

export const updateIOUStatus = (iouId: number, status: 'approved' | 'rejected'): void => {
  const updateStmt = db.prepare('UPDATE ious SET status = ? WHERE id = ?');
  updateStmt.run(status, iouId);
  
  // If approved, convert to expense
  if (status === 'approved') {
    const iouStmt = db.prepare('SELECT * FROM ious WHERE id = ?');
    const iou = iouStmt.get(iouId) as { from_user_id: number; title: string; amount: number; category_id: number; notes?: string } | undefined;
    
    if (iou) {
      addSpending({
        userId: iou.from_user_id,
        title: iou.title,
        amount: iou.amount,
        categoryId: iou.category_id,
        notes: iou.notes,
        date: new Date().toISOString(),
        isShared: false
      });
    }
  }
};

export const getIOUsForUser = (userId: number, type: 'sent' | 'received'): IOUWithDetails[] => {
  const allIOUs = getIOUsWithDetails();
  if (type === 'sent') {
    return allIOUs.filter(iou => iou.fromUserId === userId);
  } else {
    return allIOUs.filter(iou => iou.toUserId === userId);
  }
};

// Delete functions
export const deleteSpending = (spendingId: number): void => {
  const stmt = db.prepare('DELETE FROM spendings WHERE id = ?');
  stmt.run(spendingId);
};

export const deleteIOU = (iouId: number): void => {
  const stmt = db.prepare('DELETE FROM ious WHERE id = ?');
  stmt.run(iouId);
};

export default db;
