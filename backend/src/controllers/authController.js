import User from "../models/User.js";
import bcrypt from "bcryptjs";

import crypto from 'crypto';
import { sendResetLinkEmail } from '../utils/sendEmail.js';

import jwt from "jsonwebtoken";
import generateTokens from "../utils/generateTokens.js";
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Basic Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // 2. Normalize Role (Case-insensitive conversion)
    const normalizedRole = role ? role.toUpperCase() : 'STUDENT';

    // 3. Block Admin Registration Safely
    if (normalizedRole === 'ADMIN') {
      return res.status(403).json({ message: 'Admin registration via public route is restricted' });
    }

    // 4. Check Allowed Roles (Matches Enum)
    const allowedRoles = ['STUDENT', 'COMPANY'];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({ message: 'Invalid role provided' });
    }

    // 5. Check Existing User (Lowercase Email)
    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 6. Hash Password & Pin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 7. Save to Database
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: normalizedRole
    });

    return res.status(201).json({ 
      success: true, 
      message: 'User registered successfully', 
      userId: user._id 
    });
    
  } catch (error) {
    return res.status(500).json({ message: 'Server error during registration', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// 2. LOGIN USER
// -----------------------------------------------------------------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated. Contact admin.' });
    }

    // Direct Tokens Generation
    return generateTokens(user, res);

  } catch (error) {
    return res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};
// -----------------------------------------------------------------------------
// 3. REFRESH TOKEN (Sliding Window + Token Rotation)
// -----------------------------------------------------------------------------
export const refresh = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;

    if (!oldRefreshToken) {
      return res.status(401).json({ message: 'No refresh token provided, session expired' });
    }

    // 1. Verify purana token
    const decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // 2. Fetch user
    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'User invalid or inactive' });
    }

    // 3. TOKEN VERSION CHECK
    if (decoded.tokenVersion !== user.tokenVersion) {
      res.clearCookie('refreshToken');
      return res.status(401).json({ message: 'Session invalidated. Please log in again.' });
    }

    // 4. Token Rotation (Fresh Access Token + Fresh 7-Day Refresh Cookie)
    return generateTokens(user, res);

  } catch (error) {
    res.clearCookie('refreshToken');
    return res.status(401).json({ message: '7 Days inactive limit reached. Please log in again.',error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Security Practice: Ye mat batao ki email DB me hai ya nahi
      return res.status(200).json({ message: 'If an account exists, a reset link has been sent to your email.' });
    }

    // 1. Generate Random Token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // 2. Hash Token to save in Database
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // 3. Save to DB with 15 minutes Expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 Mins
    await user.save();

    // 4. Create Reset Link URL for Frontend
    const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // 5. Send Email
    await sendResetLinkEmail(cleanEmail, resetUrl);

    return res.status(200).json({
      success: true,
      message: 'Reset link sent to your email address.'
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server error while sending reset link', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// 4. DIRECT RESET PASSWORD (Security PIN Based)
// -----------------------------------------------------------------------------
export const resetPasswordWithToken = async (req, res) => {
  try {
    const { token } = req.params; // Link se token milega
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: 'New password is required' });
    }

    // 1. Hash incoming token to match DB
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // 2. Find user & verify expiry
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset link. Please request a new one.' });
    }

    // 3. Hash New Password & Save
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // 4. Clear Token Fields (Link single-use ho jayega)
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully! You can now login with your new password.'
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server error during password reset', error: error.message });
  }
};

// -----------------------------------------------------------------------------
// 5. LOGOUT (Current Device)
// -----------------------------------------------------------------------------
export const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// -----------------------------------------------------------------------------
// 6. LOGOUT ALL DEVICES
// -----------------------------------------------------------------------------
export const logoutAllDevices = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    return res.status(200).json({ success: true, message: 'Logged out from all devices successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during logout all', error: error.message });
  }
};