const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const dbPath = path.join(process.cwd(), 'sambert.db');
const db = new Database(dbPath);

console.log('Database path:', dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    budget_cap REAL DEFAULT 3000
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280'
  );

  CREATE TABLE IF NOT EXISTS spendings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category_id INTEGER NOT NULL,
    notes TEXT DEFAULT '',
    date TEXT NOT NULL,
    is_shared BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS ious (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category_id INTEGER NOT NULL,
    notes TEXT DEFAULT '',
    date TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (from_user_id) REFERENCES users(id),
    FOREIGN KEY (to_user_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );
`);

// Clear existing data
db.exec('DELETE FROM ious');
db.exec('DELETE FROM spendings');
db.exec('DELETE FROM categories');
db.exec('DELETE FROM users');

// Insert users
const insertUser = db.prepare('INSERT INTO users (name, budget_cap) VALUES (?, ?)');
insertUser.run('Bert', 3000);
insertUser.run('Sam', 3000);

// Insert categories
const insertCategory = db.prepare('INSERT INTO categories (name, emoji, color) VALUES (?, ?, ?)');
insertCategory.run('Food', '🍔', '#EF4444');
insertCategory.run('Grocery', '🛒', '#10B981');
insertCategory.run('Online Shopping', '📦', '#3B82F6');
insertCategory.run('Transport', '🚗', '#F59E0B');
insertCategory.run('Entertainment', '🎬', '#8B5CF6');
insertCategory.run('Bills', '💡', '#6B7280');

// Verify data
const users = db.prepare('SELECT * FROM users').all();
const categories = db.prepare('SELECT * FROM categories').all();

console.log('Users inserted:', users);
console.log('Categories inserted:', categories);

db.close();
console.log('Database reset complete!');
