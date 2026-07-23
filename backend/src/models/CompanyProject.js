import mongoose  from "mongoose";


const companyProjectSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  requiredSkills: [{
    type: String,
    required: true,
    trim: true,
    lowercase: true
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  deadline: {
    type: Date,
    required: [true, 'Project deadline is required']
  },
  maxSubmissions: {
    type: Number,
    default: 50,
    min: 1
  },
  perks: {
    type: String,
    trim: true,
    default: 'Certificate of Completion'
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'closed'],
    default: 'active'
  }
}, { timestamps: true });

export default mongoose.model('CompanyProject', companyProjectSchema);