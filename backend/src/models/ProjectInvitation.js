import mongoose from "mongoose";

const projectInvitationSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Company reference is required"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyProject",
      required: [true, "Project reference is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["PENDING", "ACCEPTED", "REJECTED"],
        message: "{VALUE} is not a valid invitation status",
      },
      default: "PENDING",
    },
  },
  { timestamps: true },
);

export default mongoose.model("ProjectInvitation", projectInvitationSchema);
