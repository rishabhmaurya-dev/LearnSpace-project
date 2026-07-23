import mongoose from "mongoose";

const certificateRegistrySchema = new mongoose.Schema({
  certificateId: { // Unique UUID
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['COURSE_COMPLETION', 'COMPANY_PROJECT'],
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  companyProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyProject',
    default: null
  },
  issuedByCompany: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  qrCodeUrl: {
    type: String,
    required: true,
    trim: true
  },
  pdfUrl: {
    type: String,
    required: true,
    trim: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('CertificateRegistry', certificateRegistrySchema);