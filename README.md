# 🏥 TabibiQ Frontend - منصة طبيب العراق

## 🚀 Vercel Deployment Guide

### Quick Deploy to Vercel

1. **Fork/Clone Repository**
2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set Root Directory to `frontend-iq`

3. **Environment Variables**
   Add these in Vercel Dashboard > Settings > Environment Variables:
   ```
   REACT_APP_API_URL=https://web-production-78766.up.railway.app
   REACT_APP_ENV=production
   GENERATE_SOURCEMAP=false
   ```

4. **Build Settings**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Features

- ✅ Landing Page as first page
- ✅ Multi-language support (Arabic, English, Kurdish)
- ✅ User authentication
- ✅ Doctor appointments booking
- ✅ Medicine reminders
- ✅ Health centers directory
- ✅ Responsive design

### Tech Stack

- React 18.2.0
- React Router 6.20.1
- i18next for internationalization
- CSS3 with modern design

### Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── utils/              # Utility functions
├── locales/            # Translation files
└── App.js              # Main app component
```

### API Endpoints

- Backend: `https://web-production-78766.up.railway.app`
- Health Check: `/api/health`

### Support

For deployment issues, check:
1. Environment variables are set correctly
2. Build command is `npm run build`
3. Output directory is `build`
4. Root directory is `frontend-iq`

---

**TabibiQ Team** 🏥 | **2024** 