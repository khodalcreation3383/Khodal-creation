# 🚀 Vercel Deployment Guide - Khodal Creation

Complete guide to deploy the Textile Admin system to Vercel with Cloudinary integration.

---

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository** - Push your code to GitHub
3. **MongoDB Atlas** - Already configured in `.env`
4. **Cloudinary Account** - Already configured for image uploads

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
CLOUDINARY_CLOUD_NAME=dicg9zye0
CLOUDINARY_API_KEY=412733264327615
CLOUDINARY_API_SECRET=your_api_secret_here
```

**⚠️ Important:** Replace `your_api_secret_here` with your actual Cloudinary API secret.

### Frontend Environment Variables (Vercel Dashboard)

Go to your frontend project settings on Vercel and add:

```env
VITE_API_URL=https://khodalcreation-backend.vercel.app
```

---

## 🌐 Step 2: Deploy Backend (Server)

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
8. Add all environment variables from Step 1 (including Cloudinary credentials)
9. Click **Deploy**

**Your backend will be live at:** `https://khodalcreation-backend.vercel.app`

---

## 🎨 Step 3: Deploy Frontend (Client)

### Option A: Using Vercel CLI

```bash
# Navigate back to root
cd ..

# Deploy from root (will build client automatically)
vercel --prod

# When prompted:
# - Project name: khodalcreation
# - Link to existing project: No (first time)
# - Settings: Accept defaults
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository (same repo, different project)
3. **Root Directory**: `.` (root)
4. **Framework Preset**: Other
5. **Build Command**: `npm install --prefix client && npm run build --prefix client`
6. **Output Directory**: `client/dist`
7. **Install Command**: `echo 'Skipping root install'`
8. Add environment variable: `VITE_API_URL=https://khodalcreation-backend.vercel.app`
9. Click **Deploy**

**Your frontend will be live at:** `https://khodalcreation.vercel.app`

---

## 🖼️ Cloudinary Integration (Already Configured)

The system now uses **Cloudinary** for all image uploads, which solves Vercel's ephemeral storage issue.

### Features:
✅ **Persistent Storage** - Images never get deleted on deployment
✅ **CDN Delivery** - Fast image loading worldwide
✅ **Auto Optimization** - Images automatically compressed
✅ **Transformations** - Auto-resize (designs: 1000x1000, logos: 500x500)
✅ **Serverless Ready** - No `/tmp` folder issues

### Folders on Cloudinary:
- `khodal-creation/designs/` - All design images
- `khodal-creation/logos/` - Business logos

### What's Updated:
- ✅ Upload middleware uses Cloudinary storage
- ✅ Design controller handles Cloudinary URLs
- ✅ Settings controller handles logo uploads
- ✅ Old images auto-delete from Cloudinary on update
- ✅ Helper functions for image management

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
git commit -m "Deploy to Vercel with Cloudinary"
git push origin main
```

GitHub Actions will automatically deploy both backend and frontend.

---

## 🧪 Step 5: Test Your Deployment

1. Visit `https://khodalcreation.vercel.app`
2. Login with:
   - **Email:** `admin@khodalcreation.com`
   - **Password:** `Krushil@3383`
3. Test all features:
   - ✅ Upload a design image (should go to Cloudinary)
   - ✅ Upload a logo (should go to Cloudinary)
   - ✅ Add a party
   - ✅ Create a bill
   - ✅ Download PDF invoice
   - ✅ Check if logo appears in PDF
   - ✅ Update design image (old one should delete from Cloudinary)

---

## 🐛 Troubleshooting

### Backend not responding
- Check Vercel logs: `vercel logs <deployment-url>`
- Verify MongoDB Atlas IP whitelist: Allow `0.0.0.0/0` (all IPs)
- Check environment variables are set correctly
- Verify Cloudinary credentials are correct

### Frontend can't connect to backend
- Verify `VITE_API_URL` is set in Vercel frontend project
- Check CORS settings in `server/src/index.js`
- Open browser console for error messages

### Images not uploading
- Check Cloudinary credentials in Vercel environment variables
- Verify API secret is correct (not `your_api_secret_here`)
- Check Cloudinary dashboard for upload quota
- Check browser console for upload errors

### Build failing with "vite: command not found"
- This is now fixed with updated `vercel.json` and `package.json`
- The build command now installs client dependencies first
- If still failing, check Vercel build logs for specific errors

---

## 📦 Manual Deployment Commands

### Backend
```bash
cd server
npm install
vercel --prod
```

### Frontend (from root)
```bash
npm install --prefix client
npm run build --prefix client
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
- ✅ Cloudinary credentials secured in environment variables
- ✅ Cloudinary API secret not committed to Git

---

## 📊 Cloudinary Dashboard

Monitor your uploads:
1. Go to [cloudinary.com/console](https://cloudinary.com/console)
2. Check **Media Library** for uploaded images
3. Monitor **Usage** for storage and bandwidth
4. View **Transformations** for optimization stats

---

## 📞 Support

For issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas connection
3. Check Cloudinary dashboard for upload errors
4. Verify all environment variables
5. Test API endpoints directly: `https://khodalcreation-backend.vercel.app/api/health`

---

## 📝 Important Files

- `server/src/config/cloudinary.config.js` - Cloudinary setup
- `server/src/middleware/upload.middleware.js` - Upload handling
- `server/src/utils/cloudinaryHelper.js` - Image deletion helpers
- `server/CLOUDINARY_SETUP.md` - Detailed Cloudinary documentation
- `vercel.json` (root) - Frontend deployment config
- `server/vercel.json` - Backend deployment config

---

**Happy Deploying! 🎉**
