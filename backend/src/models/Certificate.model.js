import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificateType: {
      type: String,
      enum: ["COURSE_COMPLETION", "COMPANY_PROJECT"],
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProject",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    certificateCode: {
      type: String,
      required: true,
      unique: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
