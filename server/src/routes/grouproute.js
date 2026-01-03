const express = require("express");
const {
  createGroup,
  AddmemberToGroup,
} = require("../controllers/grpcontroller");

const authMiddleware = require("../middlewares/auth");
const Group = require("../models/Group");

const router = express.Router();

/**
 * @route   POST /api/groups
 * @desc    Create a new group
 * @access  Private
 */
router.post("/", authMiddleware, createGroup);

/**
 * @route   GET /api/groups
 * @desc    Get all groups of logged-in user
 * @access  Private
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({
      members: userId,
    }).populate("createdBy", "username email");

    res.status(200).json(groups);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * @route   POST /api/groups/add-member
 * @desc    Add a member to group (creator only)
 * @access  Private
 */
router.post("/add-member", authMiddleware, AddmemberToGroup);

/**
 * @route   GET /api/groups/:groupId
 * @desc    Get a single group by ID (optional)
 * @access  Private
 */
router.get("/:groupId", authMiddleware, async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("members", "username email")
      .populate("createdBy", "username email");

    if (!group)
      return res.status(404).json({ message: "Group not found" });

    res.status(200).json(group);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
