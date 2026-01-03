const express = require("express");
const {
  uploadReel,
  getreel,
  togglelike
} = require("../controllers/reelcontroller");

const authmiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const multer = require("multer");

const router = express.Router();

// Upload a reel with error handling
const handleMulterUpload = (req, res, next) => {
  console.log("=== Starting multer upload handler ===");
  console.log("Content-Type:", req.headers['content-type']);
  console.log("Content-Length:", req.headers['content-length']);
  
  upload.single("video")(req, res, (err) => {
    if (err) {
      console.error("=== Multer error occurred ===");
      console.error("Error details:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ message: "File too large. Maximum size is 50MB" });
        }
        return res.status(400).json({ message: `Upload error: ${err.message}` });
      }
      return res.status(500).json({ message: "File upload failed", error: err.message });
    }
    console.log("=== Multer completed successfully ===");
    console.log("File received:", req.file ? "YES" : "NO");
    if (req.file) {
      console.log("File details:", {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      });
    }
    next();
  });
};

router.post("/upload", authmiddleware, handleMulterUpload, uploadReel);

// Get reels for a group
router.get("/group/:groupId", authmiddleware, getreel);

// Like / Unlike a reel
router.post("/like", authmiddleware, togglelike);

module.exports = router;