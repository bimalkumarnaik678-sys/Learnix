import jwt from 'jsonwebtoken';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, TOKEN_EXPIRES_IN, REFRESH_EXPIRES_IN } from '../config/env.js';

export const signAccessToken = (payload) =>
  jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: TOKEN_EXPIRES_IN });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN });

export const verifyRefreshToken = (token) =>
  jwt.verify(token, JWT_REFRESH_SECRET);