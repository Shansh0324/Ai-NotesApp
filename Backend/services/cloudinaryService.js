const cloudinary = require('../config/cloudinary');

/**
 * Uploads an image buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The file buffer from multer memoryStorage.
 * @param {string} folder - Cloudinary folder name (e.g. 'avatars').
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = (fileBuffer, folder = 'notesapp') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face' },
                    { quality: 'auto', fetch_format: 'auto' },
                ],
            },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );
        uploadStream.end(fileBuffer);
    });
};

/**
 * Deletes an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Cloudinary delete error:', err);
    }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
