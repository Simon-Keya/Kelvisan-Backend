import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
};

if (!config.DATABASE_URL || !config.JWT_SECRET) {
  console.error('❌ Missing required environment variables.');
  process.exit(1);
}
