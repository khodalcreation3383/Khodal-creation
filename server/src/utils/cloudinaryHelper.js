const { cloudinary } = require('../config/cloudinary.config');

/**
 * Extract public_id from Cloudinary URL
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {string} - Public ID for deletion
 */
const extractPublicId = (imageUrl) => {
  try {
    // Example URL: https://res.cloudinary.com/dicg9zye0/image/upload/v1234567890/khodal-creation/designs/abc123.jpg
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return null;
    
    // Get everything after 'upload/v1234567890/' or 'upload/'
    const pathAfterUpload = urlParts.slice(uploadIndex + 1);
    
    // Skip version if present (starts with 'v' followed by numbers)
    const startIndex = pathAfterUpload[0].match(/^v\d+$/) ? 1 : 0;
    
    // Join the remaining parts and remove file extension
    const publicIdWithExt = pathAfterUpload.slice(startIndex).join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')) || publicIdWithExt;
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} imageUrl - Full Cloudinary URL
 * @returns {Promise<boolean>} - Success status
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    if (!imageUrl) return false;
    
    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      console.error('Could not extract public_id from URL:', imageUrl);
      return false;
    }
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
};

module.exports = {
  extractPublicId,
  deleteFromCloudinary
};
