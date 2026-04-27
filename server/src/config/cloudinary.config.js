const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Create storage for designs
const designStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'khodal-creation/designs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Create storage for logos
const logoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'khodal-creation/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

module.exports = {
  cloudinary,
  designStorage,
  logoStorage
};
