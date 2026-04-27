# Cloudinary Integration Setup

## Overview
This application uses Cloudinary for cloud-based image storage and management. All image uploads (designs and logos) are now stored on Cloudinary instead of local file system.

## Configuration

### Environment Variables
Add the following variables to your `.env` files:

```env
CLOUDINARY_CLOUD_NAME=dicg9zye0
CLOUDINARY_API_KEY=412733264327615
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important:** Replace `your_api_secret_here` with your actual API secret from Cloudinary dashboard.

### Files Updated
1. **server/src/config/cloudinary.config.js** - Cloudinary configuration and storage setup
2. **server/src/middleware/upload.middleware.js** - Updated to use Cloudinary storage
3. **server/src/controllers/design.controller.js** - Updated image handling for designs
4. **server/src/controllers/settings.controller.js** - Updated logo upload handling
5. **server/src/utils/cloudinaryHelper.js** - Helper functions for Cloudinary operations

## Features

### Image Upload
- **Designs**: Uploaded to `khodal-creation/designs` folder on Cloudinary
- **Logos**: Uploaded to `khodal-creation/logos` folder on Cloudinary
- Automatic image optimization and transformation
- Maximum size limits enforced (5MB for designs, 2MB for logos)

### Image Transformations
- **Designs**: Auto-resized to max 1000x1000px (maintains aspect ratio)
- **Logos**: Auto-resized to max 500x500px (maintains aspect ratio)
- Supported formats: JPG, JPEG, PNG, GIF, WEBP

### Image Deletion
- Old images are automatically deleted from Cloudinary when:
  - A design image is updated
  - A logo is replaced
- Uses helper function `deleteFromCloudinary()` for safe deletion

## Installation

1. Install required packages:
```bash
cd server
npm install
```

2. Update your `.env` file with Cloudinary credentials

3. Restart your server:
```bash
npm run dev
```

## API Endpoints

### Design Image Upload
- **POST** `/api/designs` - Create design with image
- **PUT** `/api/designs/:id` - Update design with new image

### Logo Upload
- **POST** `/api/settings/upload-logo` - Upload business logo

## Benefits

✅ **Scalability**: No local storage limitations
✅ **Performance**: CDN-powered image delivery
✅ **Optimization**: Automatic image compression and format conversion
✅ **Reliability**: Cloud backup and redundancy
✅ **Serverless Ready**: Works perfectly with Vercel and other serverless platforms
✅ **No /tmp issues**: Eliminates temporary file storage problems on serverless

## Migration Notes

### Old vs New
- **Before**: Images stored in `server/uploads/designs/` and `server/uploads/logos/`
- **After**: Images stored on Cloudinary cloud storage
- **URLs**: Changed from `/uploads/designs/filename.jpg` to full Cloudinary URLs

### Existing Images
Existing local images will continue to work, but new uploads will go to Cloudinary. To migrate existing images:
1. Upload them manually to Cloudinary
2. Update database records with new Cloudinary URLs

## Troubleshooting

### Images not uploading
- Check environment variables are set correctly
- Verify API key and secret are valid
- Check Cloudinary dashboard for quota limits

### Old images not deleting
- Check console logs for deletion errors
- Verify public_id extraction is working correctly
- Ensure Cloudinary credentials have delete permissions

## Security Notes

⚠️ **Never commit `.env` files to version control**
⚠️ **Keep API secret secure**
⚠️ **Use environment-specific credentials for production**

## Support

For Cloudinary documentation: https://cloudinary.com/documentation
For API reference: https://cloudinary.com/documentation/image_upload_api_reference
