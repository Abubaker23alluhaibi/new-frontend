#!/bin/bash

# TabibiQ Frontend Build Script for Vercel
echo "🚀 Starting TabibiQ Frontend Build..."

# Clean install
echo "📦 Installing dependencies..."
npm ci

# Set environment variables
export REACT_APP_API_URL=https://web-production-78766.up.railway.app
export REACT_APP_ENV=production
export GENERATE_SOURCEMAP=false

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build output: build/"
else
    echo "❌ Build failed!"
    exit 1
fi 