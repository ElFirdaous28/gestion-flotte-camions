import dotenv from 'dotenv';
import path from 'path';
import { cleanEnv, str, port, bool } from 'envalid';

// Load environment variables FIRST
const env = process.env.NODE_ENV || 'development';
const envFile = `.env.${env}`;
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// THEN validate them
const config = cleanEnv(process.env, {
  PORT: port({ default: 3000 }),
  MONGO_URI: str(),
  JWT_SECRET: str(),
  JWT_REFRESH_SECRET: str(),
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  LOG_LEVEL: str({ default: 'info' }),

  // SMTP settings
  SMTP_HOST: str(),
  SMTP_PORT: port(),
  SMTP_SECURE: bool({ default: false }),
  SMTP_USER: str(),
  SMTP_PASS: str(),
});

export default config;
