import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function hashExistingPasswords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('📦 Connected to MongoDB');

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to process`);

    // Process each user
    for (const user of users) {
      try {
        // Check if password looks unhashed (you might want to adjust this check)
        if (user.password.length < 30) {
          console.log(`Processing user: ${user.email}`);
          
          // Hash the password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(user.password, salt);
          
          // Update user with hashed password
          await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword } }
          );
          
          console.log(`✅ Updated password for user: ${user.email}`);
        } else {
          console.log(`Skipping ${user.email} - password appears to be already hashed`);
        }
      } catch (err) {
        console.error(`❌ Error processing user ${user.email}:`, err);
      }
    }

    console.log('🎉 Password hashing complete!');
  } catch (err) {
    console.error('❌ Script error:', err);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
}

// Run the script
hashExistingPasswords();