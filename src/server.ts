import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './models/db';

// Load environment variables
dotenv.config();

// Parse PORT to a number and provide a default fallback
const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  try {
    // Connect to the database
    await initializeDatabase();
    console.log('✅ Database connected successfully');

    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔗 Local API: http://localhost:${PORT}`);
        console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
      }
    });

    // Handle SIGTERM gracefully
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM. Performing graceful shutdown...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('❌ Failed to start server:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL ? '[set]' : '[not set]'
      }
    });
    process.exit(1);
  }
};

startServer();