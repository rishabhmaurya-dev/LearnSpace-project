import mongoose from "mongoose";

const companyProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    website: {
      type: String,
      trim: true,
      match: [
        /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/?$/,
        "Please enter a valid website URL",
      ],
    },
    logo: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg", // Cloudinary Company Logo
    },
    industryType: {
      type: String,
      trim: true,
    },
    companySize: {
      type: String,
      trim: true,
    },
    registrationNo: {
      type: String,
      required: [true, "Registration No (CIN/GSTIN) is required"],
      trim: true,
      uppercase: true,
    },
    documentUrl: {
      type: String,
      required: [true, "Verification document URL is required"],
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ["PENDING", "APPROVED", "REJECTED"],
        message: "{VALUE} is not a valid status",
      },
      default: "PENDING",
    },
    rejectedReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.model("CompanyProfile", companyProfileSchema);
