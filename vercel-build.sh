#!/bin/bash

# Vercel Build Script for TabibiQ Frontend

echo "🚀 Starting Vercel build process..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Set environment variables
export NODE_ENV=production
export GENERATE_SOURCEMAP=false

# Build the application
echo "🔨 Building application..."
npx react-scripts build

# Check if build was successful
if [ -d "build" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Build directory contents:"
    ls -la build/
else
    echo "❌ Build failed!"
    exit 1
fi

echo "🎉 Vercel build process completed!" 