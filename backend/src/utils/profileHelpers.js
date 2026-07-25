import User from "../models/User.js";
import bcrypt from "bcryptjs";

// Helper 1: User update with Email & Name duplicate check
export const updateBaseUserData = async (
  userId,
  { name, email, photoPath },
) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (name) user.name = name.trim();

  if (email && email.toLowerCase().trim() !== user.email) {
    const emailClean = email.toLowerCase().trim();
    const emailExists = await User.findOne({ email: emailClean });
    if (emailExists) {
      const error = new Error("Email is already taken by another user.");
      error.statusCode = 400;
      throw error;
    }
    user.email = emailClean;
  }

  if (photoPath) {
    user.profilePhoto = photoPath;
  }

  await user.save();
  return user;
};

// Helper 2: Skills Sanitization
export const sanitizeSkills = (skills) => {
  if (!skills) return undefined;
  if (Array.isArray(skills)) {
    return skills
      .map((s) => (typeof s === "string" ? s.trim() : ""))
      .filter(Boolean);
  }
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

// Helper 3: URL Regex Validator
export const validateUrl = (url, type = "URL") => {
  if (!url) return;
  const regexes = {
    github: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
    website: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/?$/,
  };
  const regex =
    regexes[type.toLowerCase()] ||
    /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\/?$/;

  if (!regex.test(url.trim())) {
    const error = new Error(`Please enter a valid ${type} URL.`);
    error.statusCode = 400;
    throw error;
  }
};
