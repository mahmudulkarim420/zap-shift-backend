const User = require("../users/user.model");

const syncUser = async (req, res, next) => {
  try {
    const { clerkId, name, email, role } = req.body;

    if (!clerkId || !email || !name) {
      return res
        .status(400)
        .json({ success: false, message: "clerkId, name, and email are required" });
    }

    let user = await User.findOne({ clerkId });

    if (user) {
      user.name = name;
      user.email = email;
      if (role) user.role = role;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "User updated/synced successfully",
        user,
      });
    }

    user = await User.create({
      clerkId,
      name,
      email,
      role: role || "user",
    });

    res.status(201).json({
      success: true,
      message: "New user registered and synced successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
};
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  syncUser,
  getMe,
};
