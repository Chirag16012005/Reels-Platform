const express = require("express");

const { addComment, getComments, deleteComment, getCommentCount } = require("../controllers/commentcontroller");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// Add comment or reply (pass parentCommentId in body for reply)
router.post("/add", authMiddleware, addComment);

// Get all comments for a reel (with nested replies)
router.get("/reel/:reelId", authMiddleware, getComments);

// Get comment count for a reel
router.get("/count/:reelId", authMiddleware, getCommentCount);

// Delete a comment (soft delete)
router.delete("/:commentId", authMiddleware, deleteComment);

module.exports = router;