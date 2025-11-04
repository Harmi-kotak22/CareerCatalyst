import mongoose from "mongoose";

const fresherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [{ type: String }],
  interestedRoles: [{ type: String }],
  salaryPreferences: Number,
  workMode: { type: String, enum: ["remote", "hybrid", "onsite"] },
  savedProfiles: [{
    name: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String },
    profileUrl: { type: String, required: true },
    savedAt: { type: Date, default: Date.now },
    role: { type: String, required: true },
    thumbnailUrl: { type: String }
  }]
});

export default mongoose.model("Fresher", fresherSchema);
