# 🚀 Vercel Deployment Guide - Khodal Creation

Complete guide to deploy the Textile Admin system to Vercel.

---

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Push your code to GitHub
3. **MongoDB Atlas** - Already configured in `.env`

---

## 🔧 Step 1: Prepare Environment Variables

### Backend Environment Variables (Vercel Dashboard)

Go to your backend project settings on Vercel and add these:

```env
MONGODB_URI=mongodb+srv://khodalcreation3383:Khodalcreation3383@cluster0.cr6j02c.mongodb.net/khodal-creation
JWT_SECRET=D6oMCIB63q9k0MminVva6sJ1sRvu5GKsHqkwlQMzInZ
JWT_EXPIRE=7d
NODE_ENV=production
CLIENT_URL=https://khodalcreation.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=khodalcreation3383@gmail.com
EMAIL_PASS=pzmo kigs hixl huog
ADMIN_EMAIL=admin@khodalcreation.com
ADMIN_PASSWORD=Krushil@3383
MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
```

### Frontend Environment Variables (Vercel Dashboard)

Go to your frontend project settings on Vercel and add:

```env
VITE_API_URL=https://khodalcreation-backend.vercel.app
```

---

## 🌐 Step 2: Deploy Backend

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to server folder
cd server

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# When prompted:
# - Project name: khodalcreation-backend
# - Link to existing project: No (first time)
# - Settings: Accept defaults
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Root Directory**: `server`
4. **Framework Preset**: Other
5. **Build Command**: (leave empty)
6. **Output Directory**: (leave empty)
7. **Install Command**: `npm install`
8. Add all environment variables from Step 1
9. Click **Deploy**

**Your backend will be live at:** `https://khodalcreation-backend.vercel.app`

---

## 🎨 Step 3: Deploy Frontend

### Option A: Using Vercel CLI

```bash
# Navigate to client folder
cd client

# Deploy to production
vercel --prod

# When prompted:
# - Project name: khodalcreation
# - Link to existing project: No (first time)
# - Settings: Accept defaults
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. **Root Directory**: `client`
4. **Framework Preset**: Vite
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`
7. **Install Command**: `npm install`
8. Add environment variable: `VITE_API_URL=https://khodalcreation-backend.vercel.app`
9. Click **Deploy**

**Your frontend will be live at:** `https://khodalcreation.vercel.app`

---

## 🔄 Step 4: Auto-Deploy on Git Push (Optional)

### Using GitHub Actions

The project includes `.github/workflows/deploy.yml` for automatic deployment.

**Setup:**

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `VERCEL_TOKEN` - Get from [vercel.com/account/tokens](https://vercel.com/account/tokens)
   - `VERCEL_ORG_ID` - Get from Vercel project settings
   - `VERCEL_BACKEND_PROJECT_ID` - Get from backend project settings
   - `VERCEL_FRONTEND_PROJECT_ID` - Get from frontend project settings

3. Push to `main` branch:
```bash
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

GitHub Actions will automatically deploy both backend and frontend.

---

## ⚠️ Important Notes

### File Uploads on Vercel

Vercel serverless functions use **ephemeral storage** (`/tmp`). Uploaded files (design images, logos) will be **lost on each deployment**.

**Solutions:**

1. **Use Cloudinary** (Recommended for production):
   - Sign up at [cloudinary.com](https://cloudinary.com)
   - Update upload middleware to use Cloudinary SDK
   - Store image URLs in MongoDB

2. **Use Vercel Blob Storage**:
   - Install `@vercel/blob`
   - Update upload logic to use Vercel Blob

3. **Use AWS S3 / Google Cloud Storage**:
   - Configure S3 bucket
   - Update multer to use `multer-s3`

For now, the system works but **uploaded images will be temporary**.

---

## 🧪 Step 5: Test Your Deployment

1. Visit `https://khodalcreation.vercel.app`
2. Login with:
   - **Email:** `admin@khodalcreation.com`
   - **Password:** `Krushil@3383`
3. Test all features:
   - Create a design
   - Add a party
   - Create a bill
   - Download PDF invoice
   - Check if logo appears in PDF

---

## 🐛 Troubleshooting

### Backend not responding
- Check Vercel logs: `vercel logs <deployment-url>`
- Verify MongoDB Atlas IP whitelist: Allow `0.0.0.0/0` (all IPs)
- Check environment variables are set correctly

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set in Vercel frontend project
- Check CORS settings in `server/src/index.js`
- Open browser console for error messages

### Images not loading
- This is expected on Vercel serverless (see File Uploads section above)
- Implement Cloudinary or Vercel Blob for persistent storage

---

## 📦 Manual Deployment Commands

### Backend
```bash
cd server
vercel --prod
```

### Frontend
```bash
cd client
vercel --prod
```

---

## 🔐 Security Checklist

Before going live:

- ✅ MongoDB Atlas IP whitelist configured
- ✅ Strong JWT_SECRET set
- ✅ Admin password changed from default
- ✅ CORS origins restricted to your domains
- ✅ Rate limiting enabled
- ✅ Helmet security headers active
- ⚠️ Consider implementing Cloudinary for file uploads

---

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection
3. Verify all environment variables
4. Test API endpoints directly: `https://khodalcreation-backend.vercel.app/api/health`

---

**Happy Deploying! 🎉**
