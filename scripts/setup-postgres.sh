#!/bin/bash

echo "🚀 Setting up PostgreSQL for SplitSpend Budget App"
echo "=================================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# PostgreSQL Configuration
# Replace with your actual PostgreSQL connection details

# Option 1: Local PostgreSQL
POSTGRES_URL="postgresql://username:password@localhost:5432/budget_db"

# Option 2: Vercel Postgres (Recommended for deployment)
# POSTGRES_URL="your-vercel-postgres-connection-string"

# Option 3: Other PostgreSQL providers
# POSTGRES_URL="postgresql://username:password@host:port/database"
EOF
    echo "✅ Created .env.local file"
    echo "⚠️  Please edit .env.local with your actual PostgreSQL connection details"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🔧 Next steps:"
echo "1. Edit .env.local with your PostgreSQL connection string"
echo "2. Ensure PostgreSQL is running and accessible"
echo "3. Run: npm run dev"
echo "4. The app will auto-initialize the database on first use"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo ""
echo "🌐 To use Vercel Postgres (recommended):"
echo "   - Go to https://vercel.com/dashboard"
echo "   - Create a new Postgres database"
echo "   - Copy the connection string to .env.local"
