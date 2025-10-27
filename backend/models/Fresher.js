import mongoose from "mongoose";

const fresherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [{ type: String }],
  interestedRoles: [{ type: String }],
  salaryPreferences: Number,
  workMode: { type: String, enum: ["remote", "hybrid", "onsite"] }
});

export default mongoose.model("Fresher", fresherSchema);
