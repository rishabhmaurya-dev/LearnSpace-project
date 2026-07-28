import mongoose from "mongoose";

const companyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    industryType: {
      type: String,
      required: true,
      trim: true,
    },
    companySize: {
      type: String,
      enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
      default: "1-10",
    },
    registrationNo: {
      type: String,
      required: [true, "GSTIN or CIN registration number is required"],
      trim: true,
      unique: true,
    },
    documentUrl: {
      type: String,
      required: [true, "Verification document (Cloudinary URL) is required"],
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "BLOCKED"],
      default: "PENDING",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export const CompanyProfile = mongoose.model(
  "CompanyProfile",
  companyProfileSchema,
);
