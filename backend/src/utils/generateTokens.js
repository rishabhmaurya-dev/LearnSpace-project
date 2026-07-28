import jwt from "jsonwebtoken";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: "lax", 
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateTokens = (user, res) => {
  const accessExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
  const refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";
  const tokenVersion = user.tokenVersion ?? 0;

  // 1. Access Token (15m)
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role, tokenVersion: tokenVersion },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: accessExpiry },
  );

  // 2. Refresh Token (7d)
  const refreshToken = jwt.sign(
    { userId: user._id, tokenVersion: tokenVersion },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: refreshExpiry },
  );

  // 3. HTTP-Only Cookie
  res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

  return res.status(200).json({
    success: true,
    accessToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

export default generateTokens;
