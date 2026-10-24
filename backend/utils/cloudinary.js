import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dchfzng55',
  api_key: process.env.CLOUDINARY_API_KEY || '931117663675283',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'F1d6mBUdpRShhZgIfGfFMP9U_Os',
});

/**
 * Uploads a local file to Cloudinary with automatic cleanup and fallback.
 * @param {string} localFilePath - Path to the file on local disk
 * @param {string} folder - Target folder in Cloudinary
 * @param {string} resourceType - 'auto', 'image', 'video', or 'raw'
 * @returns {Promise<string|null>} - Returns Cloudinary secure_url or null on failure
 */
export const uploadToCloudinary = async (localFilePath, folder = 'talkyy', resourceType = 'auto') => {
  if (!localFilePath || !fs.existsSync(localFilePath)) return null;

  try {
    const isRaw = localFilePath.endsWith('.enc') || localFilePath.endsWith('.bin') || resourceType === 'raw';
    const filename = path.basename(localFilePath);
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folder,
      resource_type: isRaw ? 'raw' : resourceType,
      public_id: filename,
      use_filename: true,
      unique_filename: false,
    });

    // Clean up local disk file after successful Cloudinary upload
    try {
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch {
      // Ignore cleanup error
    }

    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error.message);
    // Return null so the calling controller can smoothly fall back to local disk storage
    return null;
  }
};

export default cloudinary;
