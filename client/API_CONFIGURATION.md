# 🔧 API Configuration Guide

## Overview
The frontend now uses **hardcoded backend URL** instead of environment variables. This ensures the correct backend URL is always used in production.

---

## Configuration File

### Location
`client/src/config/api.config.js`

### Current Backend URL
```javascript
export const BACKEND_URL = 'https://khodalcreation-backend.vercel.app';
```

---

## How It Works

### Production
- Uses hardcoded URL: `https://khodalcreation-backend.vercel.app/api`
- No environment variables needed
- Direct API calls to backend

### Development
- Uses Vite proxy: `/api` → `http://localhost:5000/api`
- Configured in `vite.config.js`
- No CORS issues in development

---

## Updating Backend URL

If you deploy backend to a different URL, update **ONE FILE**:

### File: `client/src/config/api.config.js`
```javascript
// Change this line:
export const BACKEND_URL = 'https://your-new-backend-url.vercel.app';
```

That's it! No need to update environment variables or rebuild.

---

## API Endpoints

All endpoints are defined in `api.config.js`:

```javascript
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  DESIGNS: '/api/designs',
  PARTIES: '/api/parties',
  STOCK: '/api/stock',
  BILLS: '/api/bills',
  PAYMENTS: '/api/payments',
  SETTINGS: '/api/settings',
  DASHBOARD: '/api/dashboard',
  REPORTS: '/api/reports'
};
```

---

## Usage in Components

### Import API Service
```javascript
import api from '../services/api';
```

### Make API Calls
```javascript
// Login
const response = await api.post('/auth/login', { email, password });

// Get designs
const response = await api.get('/designs');

// Create bill
const response = await api.post('/bills', billData);
```

The base URL is automatically added by axios.

---

## Environment Variables (Not Used)

### ❌ Old Way (Removed)
```env
VITE_API_URL=https://khodalcreation-backend.vercel.app
```

### ✅ New Way (Hardcoded)
```javascript
// In api.config.js
export const BACKEND_URL = 'https://khodalcreation-backend.vercel.app';
```

---

## Benefits

### ✅ Advantages:
1. **No environment variable setup needed**
2. **Single source of truth** - one file to update
3. **No build-time configuration** required
4. **Easier deployment** - just push and deploy
5. **No missing env variable errors**

### ❌ Old Issues (Fixed):
- Environment variables not loading
- Wrong URL in production
- Build-time configuration errors
- Vercel env variable sync issues

---

## Deployment

### Step 1: Update Backend URL (if needed)
Edit `client/src/config/api.config.js`

### Step 2: Build
```bash
npm run build
```

### Step 3: Deploy
```bash
vercel --prod
```

No environment variables needed in Vercel dashboard!

---

## Development Setup

### Vite Proxy Configuration
File: `client/vite.config.js`

```javascript
export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

This proxies all `/api/*` requests to `http://localhost:5000/api/*` in development.

---

## Testing

### Check Current Configuration
```javascript
import { getBaseURL, BACKEND_URL } from './config/api.config';

console.log('Backend URL:', BACKEND_URL);
console.log('Base URL:', getBaseURL());
```

### Production
```
Backend URL: https://khodalcreation-backend.vercel.app
Base URL: https://khodalcreation-backend.vercel.app/api
```

### Development
```
Backend URL: https://khodalcreation-backend.vercel.app
Base URL: /api (proxied to http://localhost:5000/api)
```

---

## Troubleshooting

### Issue: API calls failing
**Solution:** Check `api.config.js` has correct backend URL

### Issue: CORS errors
**Solution:** Backend CORS is configured to allow all Vercel domains

### Issue: 404 errors
**Solution:** Verify backend is deployed and running

### Issue: Wrong URL in production
**Solution:** Update `BACKEND_URL` in `api.config.js` and redeploy

---

## Files Modified

1. ✅ `client/src/config/api.config.js` - Created (configuration)
2. ✅ `client/src/services/api.js` - Updated (uses config)
3. ✅ `client/.env.production` - Cleared (not needed)
4. ✅ `client/.env` - Already empty (not needed)

---

## Quick Reference

### Update Backend URL
```bash
# Edit this file:
client/src/config/api.config.js

# Change this line:
export const BACKEND_URL = 'https://your-backend-url.vercel.app';
```

### Deploy
```bash
cd client
npm run build
vercel --prod
```

---

**Configuration complete! No environment variables needed! 🎉**
