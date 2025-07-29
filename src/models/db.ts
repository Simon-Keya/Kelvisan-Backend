import dotenv from 'dotenv';
import knex from 'knex'; // Import Knex.js
import path from 'path';

// Load environment variables from the root .env file.
// This ensures process.env variables are available when this file is imported.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Determine the current environment (e.g., 'development', 'production')
const environment = process.env.NODE_ENV || 'development';

// Define Knex configuration.
const knexConfig = {
  client: 'pg', // PostgreSQL client
  connection: environment === 'production' ? {
    // For production, use the full DATABASE_URL provided by Render
    // This is the most reliable way to connect on Render
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Render's PostgreSQL connections
    }
  } : {
    // For development, use individual variables from your local .env
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT|| '5432', 10),
    user: process.env.DB_USERNAME, 
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { // Connection pool settings
    min: 2,
    max: 10,
  },
};

// Initialize the Knex instance with the chosen configuration
const db = knex(knexConfig);

/**
 * Initializes the database connection.
 * This function tests the connection to the database.
 * Migrations are handled by node-pg-migrate CLI separately.
 */
export const initializeDatabase = async () => {
  try {
    // Test the database connection by executing a simple query
    await db.raw('SELECT 1');
    console.log(`✅ Database connected successfully to ${environment} environment.`);
  } catch (error) {
    console.error(`❌ Error connecting to database (${environment}):`, error);
    // It's critical to exit if database connection fails on startup
    process.exit(1);
  }
};

// Export the initialized Knex instance for use throughout your application
export default db;