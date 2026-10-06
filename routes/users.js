import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get current user profile
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile (bio, socials, name)
router.put('/update-profile', requireAuth, async (req, res) => {
  try {
    const { name, bio, socials } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (socials) {
      user.socials = { ...user.socials, ...socials };
    }

    await user.save();
    res.json({ user: { ...user.toObject(), password: undefined } });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Update settings (preferences)
router.put('/settings/update', requireAuth, async (req, res) => {
  try {
    const { theme, notifications, language } = req.body;
    const user = await User.findById(req.user._id);

    if (theme) user.preferences.theme = theme;
    if (notifications !== undefined) user.preferences.notifications = notifications;
    if (language) user.preferences.language = language;

    await user.save();
    res.json({ preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Error updating settings' });
  }
});

// Update security settings
router.put('/security/settings', requireAuth, async (req, res) => {
  try {
    const { twoFactorEnabled } = req.body;
    const user = await User.findById(req.user._id);

    if (twoFactorEnabled !== undefined) {
      user.security.twoFactorEnabled = twoFactorEnabled;
    }

    await user.save();
    res.json({ security: user.security });
  } catch (error) {
    res.status(500).json({ message: 'Error updating security settings' });
  }
});

export default router;