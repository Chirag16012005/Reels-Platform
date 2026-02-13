const Group = require("../models/Group");
const User = require("../models/User");

const createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user._id;

        if (!name)
            return res.status(400).json({
                message: "Group name is required"
            });

        const newGroup = new Group({
            name: name,
            createdBy: userId,
            members: [userId]
        });
        await newGroup.save();

        await User.findByIdAndUpdate(userId, {
            $push: { groups: newGroup._id }
        });

        res.status(201).json({
            message: "Group created successfully",
            group: newGroup
        });


    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}

const AddmemberToGroup = async (req, res) => {
    const { groupId, email } = req.body;
    const userId = req.user._id;

    try {
        const group = await Group.findById(groupId);
        if (!group)
            return res.status(404).json({ message: "Group not found" });

        if (group.createdBy.toString() !== userId.toString())
            return res.status(403).json({ message: "Only group creator can add members" });

        const memberToAdd = await User.findOne({ email });
        if (!memberToAdd)
            return res.status(404).json({ message: "User with this email not found" });

        const memberId = memberToAdd._id;

        if (group.members.includes(memberId))
            return res.status(400).json({ message: "User is already a member of the group" });

        group.members.push(memberId);
        await group.save();
        await User.findByIdAndUpdate(memberId, {
            $push: { groups: groupId }
        });
        res.status(200).json({ message: "Member added to group successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

module.exports = { createGroup, AddmemberToGroup };