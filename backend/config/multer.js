
import multer from "multer";

// Use memory storage instead of multer-storage-cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // optional: 5MB max
});

export default upload;
