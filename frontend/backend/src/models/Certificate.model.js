import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    /* ---------------- Recipient (student) ---------------- */
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student ID is required"],
      index: true,
    },

    studentName: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,
    },

    studentEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    /* ---------------- Type & status ---------------- */
    certificateType: {
      type: String,
      enum: {
        values: ["COURSE_COMPLETION"],
        message: "Invalid certificate type",
      },
      required: [true, "Certificate type is required"],
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: ["SENT", "REVOKED"],
        message: "Invalid certificate status",
      },
      default: "SENT",
      index: true,
    },

    /* ---------------- Issuer ---------------- */
    issuerType: {
      type: String,
      enum: {
        values: ["ADMIN"],
        message: "Invalid issuer type",
      },
      required: [true, "Issuer type is required"],
    },

    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ---------------- References (populate from source) ---------------- */
    // COURSE_COMPLETION
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    capstoneSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CapstoneSubmission",
      default: null,
    },

    /* ---------------- Render + template text ---------------- */
    title: {
      type: String,
      required: [true, "Certificate title is required"],
      trim: true,
    },

    websiteName: {
      type: String,
      default: "SkillForge",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /* Dynamic text shown on the template */
    metadata: {
      // student name
      studentName: { type: String, default: "", trim: true },
      // course / project name
      entityName: { type: String, default: "", trim: true },
      // e.g. skill badge or difficulty level
      subtitle: { type: String, default: "", trim: true },
      // company name (for project certificates)
      companyName: { type: String, default: "", trim: true },
      // score / rating shown optionally
      score: { type: Number, default: null },
    },

    /* ---------------- Rendered asset ---------------- */
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    pdfUrl: {
      type: String,
      default: "",
      trim: true,
    },

    certificateCode: {
      type: String,
      required: [true, "Certificate code is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    /* ---------------- Revocation ---------------- */
    revokedAt: { type: Date, default: null },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    revokedReason: { type: String, default: "", trim: true },
  },
  { timestamps: true },
);

export const Certificate = mongoose.model("Certificate", certificateSchema);
