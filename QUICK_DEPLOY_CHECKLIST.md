# ✅ Quick Deployment Checklist

## Before Deploying

### 1. Update Cloudinary API Secret
- [ ] Open `server/.env`
- [ ] Replace `your_api_secret_here` with actual API secret from Cloudinary dashboard
- [ ] Open `server/.env.production`
- [ ] Replace `your_api_secret_here` with actual API secret

### 2. Install Dependencies
```bash
cd server
npm install
```

This will install:
- `cloudinary` - For image uploads
- `multer-storage-cloudinary` - Multer storage engine

### 3. Test Locally (Optional)
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

Test image upload to verify Cloudinary is working.

---

## Deploy to Vercel

### Option 1: Deploy from Root (Frontend)
```bash
# From project root
git add .
git commit -m "Add Cloudinary integration and fix build"
git push origin main

# Then deploy
vercel --prod
```

**Vercel Settings:**
- Root Directory: `.` (root)
- Build Command: `npm install --prefix client && npm run build --prefix client`
- Output Directory: `client/dist`
- Install Command: `echo 'Skipping root install'`

**Environment Variables:**
```
VITE_API_URL=https://khodalcreation-backend.vercel.app
```

### Option 2: Deploy Backend Separately
```bash
cd server
vercel --prod
```

**Vercel Settings:**
- Root Directory: `server`
- Framework: Other
- Build Command: (empty)
- Output Directory: (empty)

**Environment Variables:**
```
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
CLOUDINARY_API_SECRET=your_actual_secret_here
```

---

## After Deployment

### Test Checklist
- [ ] Visit frontend URL
- [ ] Login with admin credentials
- [ ] Upload a design image
- [ ] Check Cloudinary dashboard - image should appear in `khodal-creation/designs/`
- [ ] Upload a logo
- [ ] Check Cloudinary dashboard - logo should appear in `khodal-creation/logos/`
- [ ] Update design image - old image should be deleted from Cloudinary
- [ ] Create a bill and download PDF
- [ ] Verify logo appears in PDF

---

## Files Changed

### Created:
- ✅ `vercel.json` (root) - Frontend deployment config
- ✅ `server/src/config/cloudinary.config.js` - Cloudinary setup
- ✅ `server/src/utils/cloudinaryHelper.js` - Image deletion helpers
- ✅ `server/CLOUDINARY_SETUP.md` - Detailed documentation

### Updated:
- ✅ `package.json` - Build command now installs client dependencies
- ✅ `server/package.json` - Added Cloudinary packages
- ✅ `server/.env` - Added Cloudinary credentials
- ✅ `server/.env.example` - Added Cloudinary placeholders
- ✅ `server/.env.production` - Added Cloudinary credentials
- ✅ `server/src/middleware/upload.middleware.js` - Uses Cloudinary storage
- ✅ `server/src/controllers/design.controller.js` - Handles Cloudinary URLs
- ✅ `server/src/controllers/settings.controller.js` - Handles Cloudinary URLs
- ✅ `DEPLOYMENT.md` - Updated with Cloudinary instructions

---

## Common Issues

### "vite: command not found"
**Fixed!** The build command now installs dependencies first.

### Images not uploading
- Check API secret is correct (not placeholder)
- Verify Cloudinary credentials in Vercel dashboard
- Check Cloudinary quota limits

### Build failing
- Make sure you pushed all changes to GitHub
- Check Vercel build logs for specific errors
- Verify `vercel.json` exists in root

---

## Quick Commands

```bash
# Install all dependencies
npm run install:all

# Run locally
npm run dev

# Deploy frontend
vercel --prod

# Deploy backend
cd server && vercel --prod

# Check Vercel logs
vercel logs <deployment-url>
```

---

## Support Links

- Vercel Dashboard: https://vercel.com/dashboard
- Cloudinary Dashboard: https://cloudinary.com/console
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub Repo: https://github.com/khodalcreation3383/Khodal-creation

---

**All set! 🚀**
