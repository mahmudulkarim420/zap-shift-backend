const { clerkClient } = require("@clerk/clerk-sdk-node");
const User = require("../modules/users/user.model");

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    const verifiedToken = await clerkClient.verifyToken(token);

    const user = await User.findOne({ clerkId: verifiedToken.sub });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found in database" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ success: false, message: "Your account has been suspended" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed", error: error.message });
  }
};

module.exports = { protect };
