const express = require("express");
const { uploadReel,getreel,togglelike } = require("../controllers/reelcontroller");
const authMiddleware = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const router = express.Router();

router.post("/upload", authMiddleware,
  upload.single("video"),
  uploadReel
);
router.get("/group/:groupid", authMiddleware, getreel);

router.post("/like", authMiddleware, togglelike);

module.exports = router;
