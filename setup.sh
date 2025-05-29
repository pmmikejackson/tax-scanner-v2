#!/bin/bash

echo "🏢 Tax Scanner v2 Setup Script"
echo "================================"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ git is not installed. Please install git first."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Install backend dependencies  
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo "📄 Setting up environment files..."

# Copy environment example files
if [ ! -f "backend/.env" ]; then
    cp backend/env.example backend/.env
    echo "✅ Created backend/.env from example"
else
    echo "⚠️  backend/.env already exists, skipping..."
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/env.example frontend/.env.local
    echo "✅ Created frontend/.env.local from example"
else
    echo "⚠️  frontend/.env.local already exists, skipping..."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up a PostgreSQL database (recommended: Supabase or Railway)"
echo "2. Update DATABASE_URL in backend/.env"
echo "3. Get a Google Maps API key and add it to both .env files"
echo "4. Run database migrations: cd backend && npx prisma migrate dev"
echo "5. Seed the database: cd backend && npm run db:seed"
echo "6. Start development servers: npm run dev"
echo ""
echo "For deployment instructions, see docs/DEPLOYMENT.md"
echo ""
echo "Happy coding! 🚀" 