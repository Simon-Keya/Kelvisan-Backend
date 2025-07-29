import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT ,
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_HOST: process.env.DB_HOST ,
  DB_PORT: process.env.DB_PORT ,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
};
