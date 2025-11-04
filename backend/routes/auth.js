import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    
    // Basic validation
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    console.log("Register request body:", req.body);

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({ 
      name, 
      email, 
      password: hashedPassword, 
      userType 
    });

    console.log("User created:", user);
    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt for:", email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Stored password:", user.password);
    console.log("Attempting to compare with provided password");

    // If password is not hashed (temporary fix for existing users)
    if (user.password === password) {
      // Update the password to be hashed for future logins
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      await User.updateOne({ _id: user._id }, { password: hashedPassword });
      console.log("Updated plain password to hashed password");
    } else {
      // Try comparing with bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password mismatch for:", email);
        return res.status(400).json({ message: "Invalid credentials" });
      }
    }

    console.log("Login successful for:", email);
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // If user is a Fresher, check if they have a profile
    if (user.userType === 'Fresher') {
      const Fresher = (await import('../models/Fresher.js')).default;
      const fresherProfile = await Fresher.findOne({ userId: user._id });
      if (fresherProfile) {
        user.isProfileComplete = true;
        await user.save();
      }
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// The verifyToken middleware is already defined at the top of the file

// Protected route to get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check profile completion status based on user type
    if (user.userType === 'Fresher') {
      const Fresher = (await import('../models/Fresher.js')).default;
      const fresherProfile = await Fresher.findOne({ userId: user._id });
      if (fresherProfile && !user.isProfileComplete) {
        user.isProfileComplete = true;
        await user.save();
      } else if (!fresherProfile && user.isProfileComplete) {
        user.isProfileComplete = false;
        await user.save();
      }
    } else if (user.userType === 'Student') {
      const isProfileComplete = user.skills && user.skills.length > 0;
      if (user.isProfileComplete !== isProfileComplete) {
        user.isProfileComplete = isProfileComplete;
        await user.save();
      }
    }

    res.json({ 
      user: {
        ...user.toObject()
      }
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user profile with skills
router.post("/update-profile", verifyToken, async (req, res) => {
  try {
    const { skills } = req.body;
    
    // Validate skills
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be provided as an array" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user skills
    user.skills = skills;
    user.isProfileComplete = skills.length > 0;
    await user.save();

    res.json({ 
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        skills: user.skills,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
