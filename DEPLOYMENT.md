# 🚀 Frontend Deployment Guide - Vercel

## Quick Deploy Steps:

### 1. Prepare Repository
- This folder contains all frontend files ready for Vercel deployment
- No `node_modules` included (will be installed automatically)

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend-deploy` folder
5. Configure environment variables
6. Deploy!

### 3. Environment Variables Setup
In Vercel dashboard, add:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

### 4. Build Settings
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 5. Domain Setup
- Vercel will provide a `.vercel.app` domain
- You can add custom domain in project settings

## Troubleshooting:
- If build fails, check Node.js version (should be 16+)
- Make sure all environment variables are set
- Check build logs for specific errors

## Support:
- Vercel Documentation: https://vercel.com/docs
- React Deployment Guide: https://create-react-app.dev/docs/deployment/ 