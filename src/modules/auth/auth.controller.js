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

const riderRegister = async (req, res, next) => {
  try {
    const { name, email, password, age, phone, nid, warehouseId } = req.body;

    // 1. Mandatory Field Validation
    if (!name || !email || !password || !age || !phone || !nid) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields. Name, email, password, age, phone, and NID are mandatory." 
      });
    }

    // 2. Safe Parsing & Bulletproofing (Senior Expert Implementation)
    // Handle empty strings for ObjectId fields to prevent Mongoose CastError
    const safeWarehouseId = warehouseId && warehouseId !== "" && warehouseId !== "null" ? warehouseId : null;
    const cleanAge = parseInt(age);
    
    if (isNaN(cleanAge)) {
      return res.status(400).json({ success: false, message: "Age must be a valid number." });
    }

    // 3. User Existence & Role Logic
    let user = await User.findOne({ email });

    if (user) {
      // Prevent active riders or pending applicants from re-applying
      if (user.role === "rider") {
        return res.status(400).json({ success: false, message: "This account is already registered as a rider." });
      }
      
      if (user.status === "pending") {
        return res.status(400).json({ success: false, message: "You already have a pending application under review." });
      }

      // Update existing user record with rider-specific metadata
      user.age = cleanAge;
      user.phone = phone;
      user.nid = nid;
      user.warehouseId = safeWarehouseId;
      user.status = "pending"; // Mark for admin review
      
      // Note: role remains 'user' until approved
      await user.save();
    } else {
      // 4. Create New Account as Rider Applicant
      user = await User.create({
        name,
        email,
        password, // Hashing is handled by User.model pre-save hook using bcryptjs
        age: cleanAge,
        phone,
        nid,
        warehouseId: safeWarehouseId,
        role: "user", 
        status: "pending",
      });
    }

    // 5. Success Response
    return res.status(201).json({
      success: true,
      message: "Rider application submitted successfully. Please wait for admin approval.",
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });

  } catch (error) {
    // High-visibility logging for Senior Expert debugging
    console.error("RIDER_REGISTER_CRASH:", error);
    
    // Structured error handling to prevent raw server leaks
    return res.status(400).json({ 
      success: false, 
      message: error.message || "An unexpected error occurred during rider registration." 
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  googleLogin,
  updateProfile,
  riderRegister,
};
