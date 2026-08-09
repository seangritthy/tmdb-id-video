#!/bin/bash
# VDOmov Server Start Script for Termux
# Starts the VDOmov Node.js backend server

set -e

echo "🎬 Starting VDOmov Server..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
fi

# Load environment variables
if [ -f ".env.local" ]; then
    echo "📋 Using .env.local configuration"
    export $(cat .env.local | xargs)
elif [ -f ".env" ]; then
    echo "📋 Using .env configuration"
    export $(cat .env | xargs)
else
    echo "⚠️ Warning: No .env file found. Using defaults."
fi

# Set Termux-specific variables
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-5050}
export HOST=${HOST:-0.0.0.0}

echo "🌍 Server will run on: http://0.0.0.0:5050"
echo "📖 Access: http://localhost:5050 (or your device IP:5050)"
echo ""

# Start the server using Termux npm script
npm run start:termux
