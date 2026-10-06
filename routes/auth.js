import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../models/User.js";
import { authLimiter } from "../middleware/rateLimit.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

const router = express.Router();

// ==============================
// 🔹 Helper functions
// ==============================
const required = (val) => val && val.trim().length > 0;
const isEmail = (val) => /\S+@\S+\.\S+/.test(val);

// ==============================
// 🔹 Register
// ==============================
router.post("/register", authLimiter, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!required(name) || !isEmail(email) || !required(password)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    // Create user (password hashed by model pre-save)
    const user = await User.create({
      name,
      email,
      password,
      role: role === "admin" ? "admin" : "student",
    });

    const payload = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user._id });

    // Send Refresh Token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Registration successful",
      user: payload,
      accessToken,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 🔹 Login
// ==============================
router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isEmail(email) || !required(password)) {
      return res.status(400).json({ message: "Invalid input" });
    }

    console.log('Login attempt:', email);
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await user.comparePassword(password);
    console.log('Password match:', match);
    if (!match) {
      console.log('Password mismatch for:', email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken({ id: user._id });

    // Send Refresh Token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Login successful",
      user: payload,
      accessToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 🔹 Refresh Access Token
// ==============================
router.post("/refresh", authLimiter, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const payload = {
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    };

    const accessToken = signAccessToken(payload);
    res.json({ accessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// ==============================
// 🔹 Logout
// ==============================
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out successfully" });
});

// ==============================
// 🔹 Forgot Password
// ==============================
router.post("/forgot-password", authLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal user existence
      return res.json({ message: "If that email is registered, a reset link has been sent." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire (15 mins)
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    await user.save();

    // Create reset url
    // In production, this would be an environment variable for the frontend URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    // Simulate sending email
    console.log(`
      ============================================
      PASSWORD RESET LINK (SIMULATED EMAIL)
      To: ${email}
      Link: ${resetUrl}
      ============================================
    `);

    res.json({ message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 🔹 Reset Password
// ==============================
router.put("/reset-password/:token", authLimiter, async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ==============================
// 🔹 Get Current User
// ==============================
router.get("/me", async (req, res) => {
  // This route assumes an auth middleware has already verified the token and attached user to req
  // Since we haven't implemented global auth middleware yet, we'll skip for now or implement basic check
  // For now, let's just return a placeholder or require the frontend to use the token payload
  res.status(501).json({ message: "Not implemented yet" });
});

export default router;
