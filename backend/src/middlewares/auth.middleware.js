import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { CompanyProfile } from "../models/CompanyProfile.model.js";

// 1. Authenticate JWT Access Token
export const protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ message: "User account is inactive or no longer exists" });
    }

    // 🚀 FIX: Token Version check taaki Logout All Devices se old access token turant revoke ho jaye
    if (decoded.tokenVersion !== user.tokenVersion) {
      return res
        .status(401)
        .json({
          message: "Session expired or invalidated. Please login again.",
        });
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Not authorized, token failed", error: error.message });
  }
};

// 2. Role-Based Access Guard
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is forbidden from accessing this route`,
      });
    }
    next();
  };
};

// 3. Approved Company Guard
export const requireApprovedCompany = async (req, res, next) => {
  try {
    const profile = await CompanyProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({
        message: "Company profile not found. Complete profile first.",
      });
    }

    if (profile.status === "PENDING") {
      return res.status(403).json({
        message:
          "Aapki company request pending hai. Admin approval ke baad access milega.",
      });
    }

    if (profile.status === "REJECTED" || profile.status === "BLOCKED") {
      return res.status(403).json({
        message: `Company status is ${profile.status}. Action restricted.`,
        reason: profile.rejectionReason,
      });
    }

    req.companyProfile = profile;
    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error checking company status",
      error: error.message,
    });
  }
};
