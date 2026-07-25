import express from 'express';
import { 
  register, 
  login, 
  refresh, 
  logout, 
  logoutAllDevices, 
  resetPasswordWithToken, 
  forgotPassword 
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", protect, logout);
router.post("/logout-all", protect, logoutAllDevices);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPasswordWithToken); // FIX: Added :token param

export default router;
