import { User } from "../models/User.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { sendResetLinkEmail } from "../utils/sendEmail.js";
import generateTokens, { COOKIE_OPTIONS } from "../utils/generateTokens.js";

// 1. REGISTER USER
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const normalizedRole = role ? role.toUpperCase() : "STUDENT";

    if (normalizedRole === "ADMIN") {
      return res
        .status(403)
        .json({ message: "Admin registration via public route is restricted" });
    }

    const allowedRoles = ["STUDENT"];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role provided" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: normalizedRole,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: user._id,
      role: user.role,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during registration",
      error: error.message,
    });
  }
};

// 2. LOGIN USER
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ message: "Account is deactivated. Contact admin." });
    }

    return generateTokens(user, res);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error during login", error: error.message });
  }
};

// 3. REFRESH TOKEN
export const refresh = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res
        .status(401)
        .json({ message: "No refresh token provided, session expired" });
    }

    const decoded = jwt.verify(
      oldRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res.status(401).json({ message: "User invalid or inactive" });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res
        .status(401)
        .json({ message: "Session invalidated. Please log in again." });
    }

    return generateTokens(user, res);
  } catch (error) {
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    return res.status(401).json({
      message: "Session expired or invalid. Please log in again.",
      error: error.message,
    });
  }
};

// 4. FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If an account exists, a reset link has been sent to your email.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 Mins
    await user.save();

    const frontendUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    await sendResetLinkEmail(cleanEmail, resetUrl);

    return res.status(200).json({
      success: true,
      message: "Reset link sent to your email address.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while sending reset link",
      error: error.message,
    });
  }
};

// 5. RESET PASSWORD
export const resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset link. Please request a new one.",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.tokenVersion += 1;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password updated successfully! You can now login with your new password.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during password reset",
      error: error.message,
    });
  }
};

// 6. LOGOUT
export const logout = async (req, res) => {
  res.clearCookie("refreshToken", COOKIE_OPTIONS);
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

// 7. LOGOUT ALL DEVICES
export const logoutAllDevices = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error during logout all",
      error: error.message,
    });
  }
};

