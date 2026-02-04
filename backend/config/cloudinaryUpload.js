
import cloudinary from "./cloudinary.js";

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - file buffer from multer
 * @param {string} folderName - folder path in Cloudinary
 * @returns {Promise} - result containing secure_url and public_id
 */
export const uploadToCloudinary = (fileBuffer, folderName) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: folderName }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      })
      .end(fileBuffer);
  });
};


export const deleteFromCloudinaryByUrl = async (url) => {
  if (!url) return null;

  try {
    // Step 1: get everything after /upload/
    let afterUpload = url.split("/upload/")[1];
    if (!afterUpload) throw new Error("Invalid Cloudinary URL");

    // Step 2: Remove version number if exists (starts with v + digits)
    afterUpload = afterUpload.replace(/^v\d+\//, ""); // remove leading v1770185474/

    // Step 3: Remove file extension
    const publicId = afterUpload.replace(/\.[^/.]+$/, "");

    // Step 4: Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    console.log("Cloudinary deletion result:", result);
    return result;
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw error;
  }
};
