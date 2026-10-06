import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET } from '../config/env.js';
import bcrypt from "bcryptjs";

export const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};