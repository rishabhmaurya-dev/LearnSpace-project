import mongoose  from "mongoose";


const companyProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  website: {
    type: String,
    required: [true, 'Website URL is required'],
    trim: true,
    lowercase: true
  },
  logo: {
    type: String,
    trim: true,
    default: 'default-logo.png'
  },
  industryType: {
    type: String,
    required: true,
    trim: true
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10'
  },
  registrationNumber: { // CIN / GSTIN
    type: String,
    required: [true, 'Registration / GSTIN ID is required'],
    trim: true,
    uppercase: true,
    unique: true
  },
  documentUrl: {
    type: String,
    required: [true, 'Verification document is required'],
    trim: true
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true,
    default: null
  }
}, { timestamps: true });

export default mongoose.model('CompanyProfile', companyProfileSchema);