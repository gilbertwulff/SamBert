# Budget App - SplitSpend

A budget tracking app for roommates to manage shared expenses and IOUs.

## Features

- 💰 Track individual and shared expenses
- 🤝 Manage IOUs between roommates
- 📊 Analytics and spending breakdowns
- 🏷️ Custom spending categories
- 👥 Multi-user support (Bert & Sam)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (Vercel Postgres)
- **Deployment**: Vercel

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (local or Vercel)

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd splitspend
   npm install
   ```

2. **Set up PostgreSQL:**

   **Option A: Local PostgreSQL**
   ```bash
   # Install PostgreSQL locally
   # macOS: brew install postgresql
   # Ubuntu: sudo apt-get install postgresql postgresql-contrib
   
   # Create database
   createdb budget_db
   
   # Set environment variables
   export POSTGRES_URL="postgresql://username:password@localhost:5432/budget_db"
   ```

   **Option B: Vercel Postgres (Recommended)**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new Postgres database
   - Copy the connection string
   - Set environment variable: `POSTGRES_URL="your-connection-string"`

3. **Initialize database:**
   ```bash
   # The app will auto-initialize on first API call
   # Or manually trigger:
   curl -X POST http://localhost:3000/api/init
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Access the app:**
   - Open [http://localhost:3000](http://localhost:3000)
   - Use the database management tools in Settings to initialize data

### Environment Variables

Create a `.env.local` file:
```env
POSTGRES_URL="your-postgres-connection-string"
```

### Database Schema

The app automatically creates these tables:
- **users**: Hardcoded users (Bert & Sam)
- **categories**: Spending categories with emojis
- **spendings**: Individual expense records
- **ious**: IOU records between users

### API Endpoints

- `GET /api/categories` - List all categories
- `POST /api/categories` - Add new category (emoji + name)
- `GET /api/spendings` - List all expenses
- `POST /api/spendings` - Add new expense
- `GET /api/analytics` - Get spending analytics
- `GET /api/ious` - List all IOUs

### Adding Categories

1. Go to Settings → Category Management
2. Enter an emoji (e.g., 🍕)
3. Enter a category name (e.g., "Pizza")
4. Click "Add Category"

### Deployment

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Add environment variables** (POSTGRES_URL)
4. **Deploy**

The app will automatically initialize the database on first deployment.

## Troubleshooting

### "Failed to fetch categories" Error
- Ensure PostgreSQL is running and accessible
- Check POSTGRES_URL environment variable
- Verify database permissions

### Database Connection Issues
- Test connection: `psql $POSTGRES_URL`
- Check firewall/network settings
- Verify database exists and is accessible

### Local Development Issues
- Use `npm run reset-db` to reset local database
- Check server logs for detailed error messages
- Ensure all environment variables are set

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.