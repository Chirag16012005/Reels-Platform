const dotenv = require("dotenv");
dotenv.config();

const cloudinary = require("cloudinary").v2;

// Validate that all required env vars are present
if (!process.env.CLOUD_NAME || !process.env.CLOUD_API_KEY || !process.env.CLOUD_API_SECRET) {
  console.error("❌ ERROR: Missing Cloudinary environment variables!");
  console.error("Required: CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

console.log("✅ Cloudinary configured with cloud_name:", process.env.CLOUD_NAME);

module.exports = cloudinary;