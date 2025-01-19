import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    rateLimit: {
      windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
      maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 10,
    },
  },
} as const;
