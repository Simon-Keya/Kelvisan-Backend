import dotenv from 'dotenv';
import knex from 'knex'; // Import Knex.js
import path from 'path';

// Load environment variables from the root .env file.
// This ensures process.env variables are available when this file is imported.
dotenv.config({ path: path.resolve(__dirname, '../../.env') }); // Adjust path if your .env is elsewhere

// Determine the current environment (e.g., 'development', 'production')
const environment = process.env.NODE_ENV || 'development';

// Define Knex configuration directly here for simplicity.
// This is the connection configuration for the Knex instance used for queries, NOT for migrations.
const knexConfig = {
  client: 'pg', // PostgreSQL client
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'kelvisan_dev',
  },
  pool: { // Connection pool settings
    min: 2,
    max: 10,
  },
  // No migrations or seeds directory here; node-pg-migrate handles that separately
};

// Initialize the Knex instance with the chosen configuration
const db = knex(knexConfig); // Use the inline knexConfig

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