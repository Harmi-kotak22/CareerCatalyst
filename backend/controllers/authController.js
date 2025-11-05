import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, userType });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

<<<<<<< HEAD
export const login = async (req, res) => {
=======
exports.login = async (req, res) => {
>>>>>>> bb9c8754cc0b8ac1958ee9aa5d08fef39caa8cd4
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Login attempt for email:', email);
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    console.log('Login successful for user:', email);
    
<<<<<<< HEAD
    // If user is a Fresher, check if they have a profile
    if (user.userType === 'Fresher') {
      const Fresher = (await import('../models/Fresher.js')).default;
      const fresherProfile = await Fresher.findOne({ userId: user._id });
      if (fresherProfile) {
        // Update isProfileComplete if not already set
        if (!user.isProfileComplete) {
          user.isProfileComplete = true;
          await user.save();
        }
      } else if (user.isProfileComplete) {
        // Reset isProfileComplete if no profile exists
        user.isProfileComplete = false;
        await user.save();
      }
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Log the full user object for debugging
    console.log('Full user object:', {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      isProfileComplete: user.isProfileComplete
    });
    
    res.status(200).json({
      message: 'Login successful',
      token,
=======
    res.status(200).json({
      message: 'Login successful',
>>>>>>> bb9c8754cc0b8ac1958ee9aa5d08fef39caa8cd4
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
<<<<<<< HEAD
        userType: user.userType,
        isProfileComplete: user.isProfileComplete
=======
        userType: user.userType
>>>>>>> bb9c8754cc0b8ac1958ee9aa5d08fef39caa8cd4
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
