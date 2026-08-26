import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must contain at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must contain at least 6 characters"],
    },

    role: {
      type: String,
      enum: {
        values: ["ADMIN", "STUDENT"],
        message: "Role must be ADMIN or STUDENT",
      },
      default: "STUDENT",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tokenVersion: {
      type: Number,
      default: 0,
      min: 0,
    },

    resetPasswordToken: {
      type: String,
      default: undefined,
    },

    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();

  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.tokenVersion;

  return userObject;
};

export const User = mongoose.model("User", userSchema);
