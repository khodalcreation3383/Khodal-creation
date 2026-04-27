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
npm install --legacy-peer-deps
```

This will install:
- `cloudinary@^2.5.1` - For image uploads (latest version)
- `multer-storage-cloudinary@^4.0.0` - Multer storage engine

**Note:** `--legacy-peer-deps` flag is needed because `multer-storage-cloudinary@4.0.0` expects `cloudinary@^1.x` but we're using `cloudinary@^2.x` which is compatible and has better features. The `server/vercel.json` file handles this automatically on Vercel with `installCommand`.

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

### Backend Deployment

```bash
cd server
vercel --prod
```

**Vercel will automatically:**
- Use `npm install --legacy-peer-deps` (configured in `server/vercel.json`)
- Build the serverless functions
- Deploy to production

**Environment Variables to Add in Vercel Dashboard:**
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

### Frontend Deployment

```bash
# From project root
vercel --prod
```

**Environment Variables to Add in Vercel Dashboard:**
```
VITE_API_URL=https://khodalcreation-backend.vercel.app
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
- ✅ `server/.npmrc` - NPM configuration for legacy peer deps
- ✅ `server/src/config/cloudinary.config.js` - Cloudinary setup
- ✅ `server/src/utils/cloudinaryHelper.js` - Image deletion helpers
- ✅ `server/CLOUDINARY_SETUP.md` - Detailed documentation

### Updated:
- ✅ `package.json` - Build command now installs client dependencies
- ✅ `server/package.json` - Added Cloudinary packages
- ✅ `server/vercel.json` - Added `installCommand: "npm install --legacy-peer-deps"`
- ✅ `server/.env` - Added Cloudinary credentials
- ✅ `server/.env.example` - Added Cloudinary placeholders
- ✅ `server/.env.production` - Added Cloudinary credentials
- ✅ `server/src/middleware/upload.middleware.js` - Uses Cloudinary storage
- ✅ `server/src/controllers/design.controller.js` - Handles Cloudinary URLs
- ✅ `server/src/controllers/settings.controller.js` - Handles Cloudinary URLs
- ✅ `DEPLOYMENT.md` - Updated with Cloudinary instructions

---

## Common Issues & Solutions

### Issue: "ERESOLVE unable to resolve dependency tree"
**Solution:** This is now fixed! The `server/vercel.json` includes:
```json
"installCommand": "npm install --legacy-peer-deps"
```
This tells Vercel to use the `--legacy-peer-deps` flag automatically.

### Issue: Images not uploading
- Check API secret is correct (not placeholder)
- Verify Cloudinary credentials in Vercel dashboard
- Check Cloudinary quota limits

### Issue: Build failing
- Make sure you pushed all changes to GitHub
- Check Vercel build logs for specific errors
- Verify `vercel.json` exists in both root and server folders

---

## Quick Commands

```bash
# Install all dependencies locally
npm run install:all

# Run locally
npm run dev

# Deploy backend
cd server && vercel --prod

# Deploy frontend
vercel --prod

# Check Vercel logs
vercel logs <deployment-url>

# Install with legacy peer deps (if needed locally)
cd server && npm install --legacy-peer-deps
```

---

## Important Notes

### Peer Dependency Conflict
- `multer-storage-cloudinary@4.0.0` requires `cloudinary@^1.21.0`
- We're using `cloudinary@^2.5.1` (latest, better features)
- Both versions are compatible (v2 is backward compatible with v1 API)
- `--legacy-peer-deps` flag resolves this conflict
- Configured in `server/vercel.json` for automatic deployment

### Cloudinary Storage
- All images stored permanently on Cloudinary
- No more Vercel `/tmp` storage issues
- CDN-powered delivery worldwide
- Automatic optimization and transformations

---

## Support Links

- Vercel Dashboard: https://vercel.com/dashboard
- Cloudinary Dashboard: https://cloudinary.com/console
- MongoDB Atlas: https://cloud.mongodb.com
- GitHub Repo: https://github.com/khodalcreation3383/Khodal-creation

---

**All set! Push to GitHub and deploy! 🚀**
