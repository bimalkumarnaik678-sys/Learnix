import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 5000;
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnai';
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_access_secret';

export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret';
export const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '15m';
export const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';
export const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
export const AI_PROVIDER = process.env.AI_PROVIDER || 'none';
export const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMMA_API_KEY = process.env.GEMMA_API_KEY;