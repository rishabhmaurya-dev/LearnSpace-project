import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateTokens = (user, res) => {

  const accessExpiry = process.env.ACCESS_TOKEN_EXPIRY || '15m';
  const refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
  const tokenVersion = user.tokenVersion ?? 0;

  // 1. Generate Short-Lived Access Token (15 min)
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role, tokenVersion: tokenVersion },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: accessExpiry }
  );

  // 2. Generate Long-Lived Refresh Token (7 days)
  const refreshToken = jwt.sign(
    { userId: user._id, tokenVersion: tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: refreshExpiry }
  );

  // 3. Set Refresh Token in Secure HTTP-Only Cookie (Sliding expiry window)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Prevents XSS script access
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // Protects against CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000
  }); 

  return res.status(200).json({
    success: true,
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
};

export default generateTokens;