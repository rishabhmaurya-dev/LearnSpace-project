import mongoose  from "mongoose";


const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  githubProfile: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/, 'Invalid GitHub URL']
  },
  completedProjectsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  reputationPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 300
  }
}, { timestamps: true });

export default mongoose.model('StudentProfile', studentProfileSchema);