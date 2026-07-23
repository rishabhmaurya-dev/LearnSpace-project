import mongoose  from "mongoose";

const projectSubmissionSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProject',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  githubLink: {
    type: String,
    required: [true, 'GitHub link is required'],
    trim: true,
    match: [/^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\/?$/, 'Invalid Repository Link']
  },
  zipFileUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['under_review', 'approved', 'rejected', 'changes_requested'],
    default: 'under_review'
  },
  companyFeedback: {
    type: String,
    trim: true,
    default: null
  }
}, { timestamps: true });

// Prevent multiple active submissions by same student on same project
projectSubmissionSchema.index({ project: 1, student: 1 }, { unique: true });

export default mongoose.model('ProjectSubmission', projectSubmissionSchema);