import dotenv from 'dotenv';
import knex from 'knex';
import path from 'path';

const environment = process.env.NODE_ENV;
if (environment !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const knexConfig = {
  client: 'pg',
  connection: environment === 'production' ? {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  } : {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000
  },
};

const db = knex(knexConfig);

export const initializeDatabase = async () => {
  try {
    await db.raw('SELECT 1');
    console.log(`✅ Database connected successfully to ${environment} environment.`);
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL);
  } catch (error) {
    console.error(`❌ Error connecting to database (${environment}):`, error);
    process.exit(1);
  }
};

export default db;