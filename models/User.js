import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ["student", "fresher", "experienced"], required: true },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
