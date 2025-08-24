import { sql } from '@vercel/postgres';
import { User, Category, Spending, SpendingWithDetails, IOU, IOUWithDetails } from './types';

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        budget_cap DECIMAL(10,2) DEFAULT 3000
      )
    `;

    // Create categories table
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        emoji VARCHAR(10) NOT NULL,
        color VARCHAR(7) DEFAULT '#6B7280'
      )
    `;

    // Create spendings table
    await sql`
      CREATE TABLE IF NOT EXISTS spendings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        notes TEXT DEFAULT '',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_shared BOOLEAN DEFAULT FALSE
      )
    `;

    // Create ious table
    await sql`
      CREATE TABLE IF NOT EXISTS ious (
        id SERIAL PRIMARY KEY,
        from_user_id INTEGER REFERENCES users(id),
        to_user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        notes TEXT DEFAULT '',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending'
      )
    `;

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Seed initial data
export async function seedInitialData() {
  try {
    // Check if users already exist
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    const userCount = parseInt(existingUsers.rows[0].count as string);
    
    if (userCount === 0) {
      console.log('Seeding initial users...');
      
      // Insert Bert and Sam
      await sql`
        INSERT INTO users (name, budget_cap) VALUES 
        ('Bert', 3000),
        ('Sam', 3000)
      `;
      
      console.log('Initial users seeded successfully');
    }

    // Check if categories already exist
    const existingCategories = await sql`SELECT COUNT(*) as count FROM categories`;
    const categoryCount = parseInt(existingCategories.rows[0].count as string);
    
    if (categoryCount === 0) {
      console.log('Seeding initial categories...');
      
      // Insert default categories
      await sql`
        INSERT INTO categories (name, emoji, color) VALUES 
        ('Food', '🍔', '#EF4444'),
        ('Grocery', '🛒', '#10B981'),
        ('Online Shopping', '📦', '#3B82F6'),
        ('Transport', '🚗', '#F59E0B'),
        ('Entertainment', '🎬', '#8B5CF6'),
        ('Bills', '💡', '#6B7280')
      `;
      
      console.log('Initial categories seeded successfully');
    }

    return true;
  } catch (error) {
    console.error('Error seeding initial data:', error);
    throw error;
  }
}

// User functions
export async function getUsers(): Promise<User[]> {
  try {
    const result = await sql`SELECT id, name, budget_cap FROM users ORDER BY id`;
    return result.rows.map(row => ({
      id: row.id as number,
      name: row.name as string,
      budgetCap: row.budget_cap ? parseFloat(row.budget_cap as string) : undefined
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUserById(id: number): Promise<User | undefined> {
  try {
    const result = await sql`SELECT id, name, budget_cap FROM users WHERE id = ${id}`;
    if (result.rows.length === 0) return undefined;
    
    const row = result.rows[0];
    return {
      id: row.id as number,
      name: row.name as string,
      budgetCap: row.budget_cap ? parseFloat(row.budget_cap as string) : undefined
    };
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
}

export async function updateUserBudget(userId: number, budgetCap: number): Promise<void> {
  try {
    await sql`UPDATE users SET budget_cap = ${budgetCap} WHERE id = ${userId}`;
  } catch (error) {
    console.error('Error updating user budget:', error);
    throw error;
  }
}

// Category functions
export async function getCategories(): Promise<Category[]> {
  try {
    const result = await sql`SELECT id, name, emoji, color FROM categories ORDER BY id`;
    return result.rows.map(row => ({
      id: row.id as number,
      name: row.name as string,
      emoji: row.emoji as string,
      color: row.color as string
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function addCategory(name: string, emoji: string, color: string = '#6B7280'): Promise<Category> {
  try {
    const result = await sql`
      INSERT INTO categories (name, emoji, color) 
      VALUES (${name}, ${emoji}, ${color}) 
      RETURNING id, name, emoji, color
    `;
    
    const row = result.rows[0];
    return {
      id: row.id as number,
      name: row.name as string,
      emoji: row.emoji as string,
      color: row.color as string
    };
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
}

// Spending functions
export async function getSpendings(): Promise<Spending[]> {
  try {
    const result = await sql`
      SELECT id, user_id, title, amount, category_id, notes, date, is_shared 
      FROM spendings 
      ORDER BY date DESC
    `;
    
    return result.rows.map(row => ({
      id: row.id as number,
      userId: row.user_id as number,
      title: row.title as string,
      amount: parseFloat(row.amount as string),
      categoryId: row.category_id as number,
      notes: row.notes as string || '',
      date: (row.date as Date).toISOString(),
      isShared: row.is_shared as boolean
    }));
  } catch (error) {
    console.error('Error fetching spendings:', error);
    throw error;
  }
}

export async function addSpending(spending: Omit<Spending, 'id'>): Promise<Spending> {
  try {
    const result = await sql`
      INSERT INTO spendings (user_id, title, amount, category_id, notes, date, is_shared)
      VALUES (${spending.userId}, ${spending.title}, ${spending.amount}, ${spending.categoryId}, 
              ${spending.notes || ''}, ${spending.date}, ${spending.isShared})
      RETURNING id, user_id, title, amount, category_id, notes, date, is_shared
    `;
    
    const row = result.rows[0];
    return {
      id: row.id as number,
      userId: row.user_id as number,
      title: row.title as string,
      amount: parseFloat(row.amount as string),
      categoryId: row.category_id as number,
      notes: row.notes as string || '',
      date: (row.date as Date).toISOString(),
      isShared: row.is_shared as boolean
    };
  } catch (error) {
    console.error('Error adding spending:', error);
    throw error;
  }
}

export async function deleteSpending(id: number): Promise<void> {
  try {
    await sql`DELETE FROM spendings WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting spending:', error);
    throw error;
  }
}

// IOU functions
export async function getIOUs(): Promise<IOU[]> {
  try {
    const result = await sql`
      SELECT id, from_user_id, to_user_id, title, amount, category_id, notes, date, status
      FROM ious 
      ORDER BY date DESC
    `;
    
    return result.rows.map(row => ({
      id: row.id as number,
      fromUserId: row.from_user_id as number,
      toUserId: row.to_user_id as number,
      title: row.title as string,
      amount: parseFloat(row.amount as string),
      categoryId: row.category_id as number,
      notes: row.notes as string || '',
      date: (row.date as Date).toISOString(),
      status: row.status as 'pending' | 'approved' | 'rejected'
    }));
  } catch (error) {
    console.error('Error fetching IOUs:', error);
    throw error;
  }
}

export async function addIOU(iou: Omit<IOU, 'id'>): Promise<IOU> {
  try {
    const result = await sql`
      INSERT INTO ious (from_user_id, to_user_id, title, amount, category_id, notes, date, status)
      VALUES (${iou.fromUserId}, ${iou.toUserId}, ${iou.title}, ${iou.amount}, 
              ${iou.categoryId}, ${iou.notes || ''}, ${iou.date}, ${iou.status})
      RETURNING id, from_user_id, to_user_id, title, amount, category_id, notes, date, status
    `;
    
    const row = result.rows[0];
    return {
      id: row.id as number,
      fromUserId: row.from_user_id as number,
      toUserId: row.to_user_id as number,
      title: row.title as string,
      amount: parseFloat(row.amount as string),
      categoryId: row.category_id as number,
      notes: row.notes as string || '',
      date: (row.date as Date).toISOString(),
      status: row.status as 'pending' | 'approved' | 'rejected'
    };
  } catch (error) {
    console.error('Error adding IOU:', error);
    throw error;
  }
}

export async function updateIOUStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<Spending | undefined> {
  try {
    // Update IOU status
    await sql`UPDATE ious SET status = ${status} WHERE id = ${id}`;
    
    // If approved, convert to spending
    if (status === 'approved') {
      const iouResult = await sql`
        SELECT from_user_id, to_user_id, title, amount, category_id, notes 
        FROM ious 
        WHERE id = ${id}
      `;
      
      if (iouResult.rows.length > 0) {
        const iou = iouResult.rows[0];
        
        const spending = {
          userId: iou.to_user_id as number,
          title: `💕 ${iou.title}`,
          amount: parseFloat(iou.amount as string),
          categoryId: iou.category_id as number,
          notes: iou.notes as string || '',
          date: new Date().toISOString(),
          isShared: false
        };
        
        return await addSpending(spending);
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error updating IOU status:', error);
    throw error;
  }
}

export async function deleteIOU(id: number): Promise<void> {
  try {
    await sql`DELETE FROM ious WHERE id = ${id}`;
  } catch (error) {
    console.error('Error deleting IOU:', error);
    throw error;
  }
}

// Analytics functions
export async function getMonthlyTotal(userId: number, month: number, year: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM spendings 
      WHERE user_id = ${userId}
      AND EXTRACT(MONTH FROM date) = ${month + 1}
      AND EXTRACT(YEAR FROM date) = ${year}
    `;
    
    return parseFloat(result.rows[0].total as string);
  } catch (error) {
    console.error('Error getting monthly total:', error);
    throw error;
  }
}

export async function getCombinedMonthlyTotal(month: number, year: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COALESCE(SUM(amount), 0) as total
      FROM spendings 
      WHERE EXTRACT(MONTH FROM date) = ${month + 1}
      AND EXTRACT(YEAR FROM date) = ${year}
    `;
    
    return parseFloat(result.rows[0].total as string);
  } catch (error) {
    console.error('Error getting combined monthly total:', error);
    throw error;
  }
}

export async function getSharedExpensesTotal(month: number, year: number): Promise<number> {
  try {
    const result = await sql`
      SELECT COALESCE(SUM(amount * 2), 0) as total
      FROM spendings 
      WHERE is_shared = true
      AND EXTRACT(MONTH FROM date) = ${month + 1}
      AND EXTRACT(YEAR FROM date) = ${year}
    `;
    
    return parseFloat(result.rows[0].total as string);
  } catch (error) {
    console.error('Error getting shared expenses total:', error);
    throw error;
  }
}

export async function getCategoryBreakdown(userId: number, month: number, year: number): Promise<{ name: string; value: number; emoji: string }[]> {
  try {
    const result = await sql`
      SELECT c.name, c.emoji, COALESCE(SUM(s.amount), 0) as total
      FROM categories c
      LEFT JOIN spendings s ON c.id = s.category_id 
        AND s.user_id = ${userId}
        AND EXTRACT(MONTH FROM s.date) = ${month + 1}
        AND EXTRACT(YEAR FROM s.date) = ${year}
      GROUP BY c.id, c.name, c.emoji
      HAVING COALESCE(SUM(s.amount), 0) > 0
      ORDER BY total DESC
    `;
    
    return result.rows.map(row => ({
      name: row.name as string,
      value: parseFloat(row.total as string),
      emoji: row.emoji as string
    }));
  } catch (error) {
    console.error('Error getting category breakdown:', error);
    throw error;
  }
}
