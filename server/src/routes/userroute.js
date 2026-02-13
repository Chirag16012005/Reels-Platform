const express = require("express");
const router = express.Router();
const User = require("../models/User");

// IMPORTANT: /search must come BEFORE /:userId to avoid "search" being matched as userId
router.get("/search", async (req, res) => {
    try {
        const { name } = req.query;

        if (!name || name.length < 2) {
            return res.status(400).json({ message: "Name must be at least 2 characters" });
        }

        const users = await User.find({
            username: { $regex: name, $options: "i" }
        }).select("username email _id").limit(6);

        res.json(users);
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({
            username: user.username,
            id: user._id,
            email: user.email
        });
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;