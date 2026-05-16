const User = require("../users/user.model");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, image } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      image: image || "",
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      res.status(200).json({
        success: true,
        token: generateToken(user._id),
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        },
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { email, name, image } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: "Email and name are required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // Create a new user with a random secure password if they don't exist
      const randomPassword = Math.random().toString(36).slice(-10) + Date.now();
      user = await User.create({
        name,
        email,
        password: randomPassword,
        role: "user",
        status: "active",
        image: image || "",
      });
    } else if (image && !user.image) {
      // Update image if user exists but has no image
      user.image = image;
      await user.save();
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, image } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(image !== undefined && { image }),
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          image: updatedUser.image,
          phone: updatedUser.phone,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  googleLogin,
  updateProfile,
};
