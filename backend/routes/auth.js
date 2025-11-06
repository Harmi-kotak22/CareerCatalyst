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

import { register, login } from "../controllers/authController.js";

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// The verifyToken middleware is already defined at the top of the file

// Protected route to get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let profileData = { ...user.toObject() };

    // Check profile completion status based on user type
    if (user.userType === 'Fresher') {
      const Fresher = (await import('../models/Fresher.js')).default;
      const fresherProfile = await Fresher.findOne({ userId: user._id });
      if (fresherProfile) {
        profileData.skills = fresherProfile.skills || [];
        if (!user.isProfileComplete) {
          user.isProfileComplete = true;
          await user.save();
        }
      } else if (user.isProfileComplete) {
        user.isProfileComplete = false;
        await user.save();
      }
    } else if (user.userType === 'Student') {
      const Student = (await import('../models/Student.js')).default;
      const studentProfile = await Student.findOne({ userId: user._id });
      if (studentProfile) {
        profileData.skills = studentProfile.skills || [];
        const isProfileComplete = studentProfile.skills && studentProfile.skills.length > 0;
        if (user.isProfileComplete !== isProfileComplete) {
          user.isProfileComplete = isProfileComplete;
          await user.save();
        }
      }
    }

    res.json({ 
      user: profileData
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

    // Update skills based on user type
    if (user.userType === 'Student') {
      const Student = (await import('../models/Student.js')).default;
      let studentProfile = await Student.findOne({ userId: user._id });
      
      if (!studentProfile) {
        // Create student profile if it doesn't exist
        studentProfile = new Student({
          userId: user._id,
          skills: []
        });
      }
      
      // Update skills in student profile
      studentProfile.skills = skills;
      await studentProfile.save();
      
      // Update user's profile completion status
      user.isProfileComplete = skills.length > 0;
      await user.save();
      
      console.log('Updated student profile skills:', studentProfile);
    }

    res.json({ 
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        skills: skills, // Return the updated skills
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
