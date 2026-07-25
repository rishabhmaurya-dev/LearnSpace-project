import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import CompanyProfile from "../models/CompanyProfile.js";
import bcrypt from "bcryptjs";
import {
  updateBaseUserData,
  sanitizeSkills,
  validateUrl,
} from "../utils/profileHelpers.js";

// =============================================================================
// 1. GET PROFILE & CHANGE PASSWORD
// =============================================================================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let extraDetails = null;
    if (user.role === "STUDENT")
      extraDetails = await StudentProfile.findOne({ user: user._id });
    if (user.role === "COMPANY")
      extraDetails = await CompanyProfile.findOne({ user: user._id });

    return res
      .status(200)
      .json({ success: true, user, profileDetails: extraDetails });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error fetching profile", error: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Old and new passwords are required" });
    }
    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Incorrect current password" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.tokenVersion += 1;
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    return res.status(500).json({
      message: "Server error changing password",
      error: error.message,
    });
  }
};

// =============================================================================
// 2. ADMIN PROFILE
// =============================================================================
export const updateAdminProfile = async (req, res) => {
  try {
    const user = await updateBaseUserData(req.user._id, {
      name: req.body.name,
      email: req.body.email,
      photoPath: req.file?.path,
    });

    return res.status(200).json({
      success: true,
      message: "Admin profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// =============================================================================
// 3. STUDENT PROFILE (Create & Update)
// =============================================================================
export const createStudentProfile = async (req, res) => {
  try {
    const { githubProfile, skills, bio } = req.body;

    const existing = await StudentProfile.findOne({ user: req.user._id });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Profile already exists. Use update endpoint." });
    }

    // 1. User Photo Update (if uploaded)
    let updatedUser = null;
    if (req.file) {
      updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { profilePhoto: req.file.path },
        { new: true },
      ).select("-password");
    } else {
      updatedUser = await User.findById(req.user._id).select("-password");
    }

    validateUrl(githubProfile, "GitHub");

    // 2. Create Profile with Self-Declared Skills
    const newProfile = await StudentProfile.create({
      user: req.user._id,
      selfDeclaredSkills: sanitizeSkills(skills) || [],
      githubProfile: githubProfile?.trim() || "",
      bio: bio?.trim() || "",
      verifiedSkillBadges: [], // Initially Empty (Courses se bharega)
    });

    return res.status(201).json({
      success: true,
      message: "Student profile created successfully!",
      user: updatedUser,
      profile: newProfile,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    const { name, email, githubProfile, skills, bio } = req.body;

    await updateBaseUserData(req.user._id, {
      name,
      email,
      photoPath: req.file?.path,
    });

    validateUrl(githubProfile, "GitHub");

    const updateFields = {};

    if (skills) updateFields.selfDeclaredSkills = sanitizeSkills(skills);

    if (githubProfile !== undefined)
      updateFields.githubProfile = githubProfile.trim();

    if (bio !== undefined) updateFields.bio = bio.trim();

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true },
    ).populate("user", "name email role profilePhoto");

    if (!profile) {
      return res
        .status(404)
        .json({ message: "Profile not found. Create profile first." });
    }

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully!",
      profile,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

// =============================================================================
// 4. COMPANY PROFILE (Create & Update)
// =============================================================================
export const createCompanyProfile = async (req, res) => {
  try {
    const { companyName, website, industryType, companySize, registrationNo } =
      req.body;
    
    const existing = await CompanyProfile.findOne({ user: req.user._id });
    if (existing)
      return res
        .status(400)
        .json({ message: "Company profile already exists." });

    const logoUrl = req.files?.logoFile?.[0]?.path || req.body.logo;
    const documentUrl =
      req.files?.documentFile?.[0]?.path || req.body.documentUrl;

    if (!registrationNo || !documentUrl) {
      return res.status(400).json({
        message:
          "Registration No (GSTIN/CIN) and verification document required.",
      });
    }

    validateUrl(website, "Website");

    const profile = await CompanyProfile.create({
      user: req.user._id,
      companyName: companyName ? companyName.trim() : req.user.name,
      website: website?.trim() || "",
      logo: logoUrl || "",
      industryType: industryType?.trim() || "",
      companySize: companySize?.trim() || "",
      registrationNo: registrationNo.trim().toUpperCase(),
      documentUrl,
      verificationStatus: "PENDING",
    });

    return res
      .status(201)
      .json({ success: true, message: "Company profile created!", profile });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const { companyName, email, website, industryType, companySize } = req.body;

    await updateBaseUserData(req.user._id, {
      name: companyName,
      email,
    });

    validateUrl(website, "Website");

    const existing = await CompanyProfile.findOne({ user: req.user._id });
    if (!existing)
      return res
        .status(404)
        .json({ message: "Profile not found. Create first." });

    const logoUrl = req.files?.logoFile?.[0]?.path || req.body.logo;
    const documentUrl =
      req.files?.documentFile?.[0]?.path || req.body.documentUrl;

    const updateFields = {};
    if (companyName) updateFields.companyName = companyName.trim();
    if (website !== undefined) updateFields.website = website.trim();
    if (industryType !== undefined)
      updateFields.industryType = industryType.trim();
    if (companySize !== undefined)
      updateFields.companySize = companySize.trim();
    if (logoUrl) updateFields.logo = logoUrl;

    // Reset status to PENDING on document update if rejected

    if (req.body.registrationNo || documentUrl) {
      if (req.body.registrationNo)
        updateFields.registrationNo = req.body.registrationNo
          .trim()
          .toUpperCase();
      if (documentUrl) updateFields.documentUrl = documentUrl;
      if (existing.verificationStatus === "REJECTED") {
        updateFields.verificationStatus = "PENDING";
        updateFields.rejectedReason = "";
      }
    }

    const profile = await CompanyProfile.findOneAndUpdate(
      { user: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true },
    ).populate("user", "name email role");

    return res
      .status(200)
      .json({ success: true, message: "Company profile updated!", profile });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};
