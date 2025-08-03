#!/bin/bash

echo "🚀 Starting Vercel build process..."

# Set environment variables for production
export REACT_APP_API_URL=https://web-production-78766.up.railway.app
export REACT_APP_ENV=production
export GENERATE_SOURCEMAP=false
export NODE_ENV=production

# Clean install dependencies with legacy peer deps
echo "📦 Installing dependencies..."
npm ci --legacy-peer-deps

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
if [ -d "build" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build directory contents:"
    ls -la build/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Vercel build process completed!" 