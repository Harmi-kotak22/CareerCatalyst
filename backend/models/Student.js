import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [{ type: String }]
}, { 
  timestamps: true 
});

export default mongoose.model("Student", studentSchema);
