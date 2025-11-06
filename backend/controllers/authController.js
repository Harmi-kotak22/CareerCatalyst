import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Fresher from '../models/Fresher.js';
import Experienced from '../models/Experienced.js';

export const register = async (req, res) => {
  try {
    console.log('Registration request body:', req.body);
    let { name, email, password, userType } = req.body;
    
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Normalize userType to have first letter uppercase and rest lowercase
    userType = userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase();
    
    console.log('Registering new user:', { name, email, userType });
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash, userType });
    await user.save();
    console.log('User document created:', user._id);

    // Create corresponding profile based on userType
    try {
      if (userType === 'Student') {
        console.log('Creating student profile for user:', user._id);
        const studentProfile = new Student({
          userId: user._id,
            skills: []
          // name: user.name,
          // email: user.email,
        });
        await studentProfile.save();
        console.log('Student profile created successfully:', studentProfile);
        
        user.isProfileComplete = true;
        await user.save();
        console.log('Updated user isProfileComplete to true');
      } else if (userType === 'Fresher') {
        console.log('Creating fresher profile for user:', user._id);
        const fresherProfile = new Fresher({
          userId: user._id,
          name: user.name,
          email: user.email,
        });
        await fresherProfile.save();
        console.log('Fresher profile created successfully:', fresherProfile);
      } else if (userType === 'Experienced') {
        console.log('Creating experienced profile for user:', user._id);
        const experiencedProfile = new Experienced({
          userId: user._id,
        });
        await experiencedProfile.save();
        console.log('Experienced profile created successfully:', experiencedProfile);
      }
    } catch (profileError) {
      console.error('Error creating profile:', profileError);
      // If profile creation fails, we should probably delete the user
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req, res) => {
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
    
    // Check for profile based on user type
    const normalizedUserType = user.userType.charAt(0).toUpperCase() + user.userType.slice(1).toLowerCase();
    console.log('Checking profile for normalized userType:', normalizedUserType);
    
    if (normalizedUserType === 'Fresher') {
      console.log('Looking for Fresher profile for user:', user._id);
      const fresherProfile = await Fresher.findOne({ userId: user._id });
      console.log('Found Fresher profile:', fresherProfile);
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
    } else if (normalizedUserType === 'Student') {
      console.log('Checking student profile for user:', user._id);
      const studentProfile = await Student.findOne({ userId: user._id });
      console.log('Found student profile:', studentProfile);
      if (studentProfile) {
        console.log('Student profile exists, current isProfileComplete:', user.isProfileComplete);
        // Update isProfileComplete if not already set
        if (!user.isProfileComplete) {
          user.isProfileComplete = true;
          await user.save();
          console.log('Updated isProfileComplete to true');
        }
      } else if (user.isProfileComplete) {
        console.log('No student profile found, resetting isProfileComplete');
        // Reset isProfileComplete if no profile exists
        user.isProfileComplete = false;
        await user.save();
      }
    } else if (normalizedUserType === 'Experienced') {
      console.log('Checking experienced profile for user:', user._id);
      const experiencedProfile = await Experienced.findOne({ userId: user._id });
      console.log('Found experienced profile:', experiencedProfile);
      // Check if profile exists and has required fields
      if (experiencedProfile && experiencedProfile.skills && experiencedProfile.reasonForSwitch && 
          experiencedProfile.salaryPreferences && experiencedProfile.experienceYears && experiencedProfile.workMode) {
        console.log('Experienced profile is complete');
        if (!user.isProfileComplete) {
          user.isProfileComplete = true;
          await user.save();
          console.log('Updated isProfileComplete to true');
        }
      } else {
        console.log('Experienced profile incomplete or missing required fields');
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        isProfileComplete: user.isProfileComplete
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
