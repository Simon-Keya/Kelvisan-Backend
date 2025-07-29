import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './models/db'; // CORRECTED: Import from src/database/index.ts

// Load environment variables from .env file at the application's entry point
dotenv.config();

// Parse PORT to a number and provide a default fallback
const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  try {
    // Connect to the database and ensure the connection is healthy
    // Migrations are run separately via CLI (npm run migrate:latest)
    await initializeDatabase();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);

      // Only show localhost URLs if in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔗 Local API: http://localhost:${PORT}`);
        console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Exit with failure code if server cannot start (e.g., DB connection fails)
  }
};

// Initiate the server startup process
startServer();