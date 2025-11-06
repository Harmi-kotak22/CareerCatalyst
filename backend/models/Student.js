import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skills: [{ type: String }],
  currentEducation: {
    level: { type: String, enum: ['High School', 'Bachelors', 'Masters', 'PhD'] },
    institution: { type: String },
    major: { type: String },
    graduationYear: { type: Number }
  },
  interests: [{ type: String }],
  academicPerformance: {
    gpa: { type: Number },
    achievements: [{ type: String }]
  },
  savedProfiles: [{
    name: { type: String },
    title: { type: String },
    company: { type: String },
    profileUrl: { type: String },
    thumbnailUrl: { type: String },
    role: { type: String },
    savedAt: { type: Date, default: Date.now }
  }],
  learningProgress: [{
    skill: { type: String },
    status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'] },
    startedAt: { type: Date },
    completedAt: { type: Date }
  }]
}, { 
  timestamps: true 
});

export default mongoose.model("Student", studentSchema);
