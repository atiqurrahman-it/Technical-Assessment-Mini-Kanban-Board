import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

// Single source of truth for env-derived config — every other module reads
// from here instead of touching `process.env` directly.
export default {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  database_url: process.env.DATABASE_URL,
  jwt_secret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',
  cors_origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
