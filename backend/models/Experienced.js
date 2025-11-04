import mongoose from "mongoose";

const experiencedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [{ type: String }],
  reasonForSwitch: String,
  salaryPreferences: Number,
  experienceYears: Number,
  workMode: { type: String, enum: ["remote", "hybrid", "onsite"] },
  additionalAchievements: String
});

export default mongoose.model("Experienced", experiencedSchema);
