import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["Student", "Fresher", "Experienced"], required: true },
  skills: [String],
  isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
