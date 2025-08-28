#!/bin/bash

# JobFlow Clean - Quick Start Script

echo "========================================="
echo "JobFlow Clean - Starting Services"
echo "========================================="

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Please copy .env.local.example to .env.local and fill in your values"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
pip install -r backend/requirements.txt

# Start services
echo "🚀 Starting services..."

# Start Next.js in background
echo "Starting frontend on http://localhost:3000..."
npm run dev &

# Wait a moment for frontend to start
sleep 5

# Start backend API (optional - only if using Python backend)
# echo "Starting backend API on http://localhost:8000..."
# cd backend && python -m uvicorn api.main:app --reload --port 8000 &

echo ""
echo "========================================="
echo "✅ Services Started!"
echo "========================================="
echo ""
echo "Frontend: http://localhost:3000"
echo "Admin Panel: http://localhost:3000/admin"
echo "Settings: http://localhost:3000/settings"
echo ""
echo "To run email delivery test:"
echo "python run_email_delivery.py --test"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================="

# Wait for interrupt
wait