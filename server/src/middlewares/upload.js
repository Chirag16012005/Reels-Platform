const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../../config/cloudinary");

// Validate Cloudinary config
console.log("Cloudinary config check:", {
  hasCloudName: !!process.env.CLOUD_NAME,
  hasApiKey: !!process.env.CLOUD_API_KEY,
  hasApiSecret: !!process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "reels_app",
    resource_type: "video",
    allowed_formats: ["mp4", "mov", "webm"],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;