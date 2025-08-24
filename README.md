# 💰 SamBert - Budget Tracker

A modern, mobile-first budget tracking app designed for couples to manage their shared and individual expenses.

## ✨ Features

### 🔐 Simple Authentication
- Two users: "Bert" and "Sam"
- Quick user selection on app launch
- Session persistence with localStorage

### ➕ Add Expenses
- **Required fields**: Title, Amount, Category
- **Optional**: Notes (toggle to show)
- **Quick category buttons**: Dynamic sizing based on content
- **Split expenses**: Toggle to automatically divide amount between both users
- **Time tracking**: Expenses logged with timestamp

### 📊 Dashboard & Analytics
- **Monthly totals**: Individual, combined, and shared spending views
- **Budget tracking**: Set monthly budget caps with progress indicators
- **Category breakdown**: Pie chart showing spending by category
- **Quick stats**: Food, Online Shopping, Entertainment summary cards
- **Recent expenses**: Color-coded chronological list

### 💕 Pinjam (IOUs)
- Track money owed between partners
- "I Owe" and "Owed to Me" tabs
- Approve/reject pending IOUs
- Mark as paid to convert to expenses (with 💕 emoji)
- Notes support for additional context

### 🗑️ Delete Functionality
- Delete expenses and IOUs with confirmation dialogs
- Available in "All Transactions" view
- Red hover states for delete buttons

### 📱 Mobile-First Design
- PWA support with manifest.json
- iOS-specific meta tags for home screen app
- Responsive design optimized for mobile devices
- Modern green color scheme (#B5FFE1, #93E5AB, #65B891)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with better-sqlite3
- **UI Components**: Shadcn/UI + Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **PWA**: Manifest.json for native app experience

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## 📦 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with default settings
4. The app will automatically create a SQLite database on first run

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

### Environment Variables

No environment variables required. The app uses a local SQLite database that is created automatically.

## 📱 Mobile App Experience

Add to your home screen for a native app experience:
- **iOS**: Safari > Share > Add to Home Screen
- **Android**: Chrome > Menu > Add to Home Screen

Features full-screen mode, custom icons, and splash screens.

## 📱 How to Use

1. **Select User**: Choose between "Bert" or "Sam" on the welcome screen
2. **View Dashboard**: See spending analytics, budget progress, and charts
3. **Add Expense**: Use the floating + button to add new expenses
4. **Track IOUs**: Use the Pinjam tab to manage money owed
5. **View Transactions**: Click "View More" to see all transactions with delete options
6. **Manage Settings**: Configure budgets and user profiles

## 🎨 Design Features

- **Clean UI**: Modern card-based layout with green color scheme
- **Emoji-driven**: Visual category identification
- **Quick actions**: Minimal taps to add expenses
- **Color coding**: Category colors on transaction lists
- **Confirmation dialogs**: Prevent accidental deletions
- **Dynamic buttons**: Content-based sizing for categories

## 🔄 Data Architecture

- **API Routes**: Next.js API endpoints for all database operations
- **Client-side wrapper**: Abstracted fetch calls with error handling
- **SQLite database**: Persistent local storage
- **Type safety**: Full TypeScript interfaces
- **Real-time updates**: Automatic refresh after data changes

---

Built with ❤️ for couples who want to manage their finances together!