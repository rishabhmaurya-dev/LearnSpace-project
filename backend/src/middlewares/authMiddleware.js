import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js"

// 1. Verify Access Token Middleware
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user || !req.user.isActive) {
        return res.status(401).json({ message: 'User account is deactivated or not found' });
      }

      return next();

    } catch (error) {
      return res.status(401).json({ message: 'Access token expired or invalid',error: error.message });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no access token provided' });
  }
};

// 2. Role-Based Access Control (RBAC)

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Role (${req.user.role}) is not authorized to access this resource` 
      });
    }
    next();
  };
};

