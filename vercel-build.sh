#!/bin/bash

# Set environment variables for production
export REACT_APP_API_URL=https://web-production-78766.up.railway.app
export REACT_APP_ENV=production
export GENERATE_SOURCEMAP=false

# Clean install dependencies
npm ci --only=production

# Build the application
npm run build

# Verify build output
if [ -d "build" ]; then
    echo "Build completed successfully!"
    ls -la build/
else
    echo "Build failed!"
    exit 1
fi 