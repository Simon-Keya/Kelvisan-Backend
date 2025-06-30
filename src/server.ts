import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './models/db';

dotenv.config();

const PORT = process.env.PORT ;

const startServer = async () => {
  try {
    // Connect to the database and ensure tables exist
    await initializeDatabase();

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      
      // Only show localhost if in development
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔗 Local access: http://localhost:${PORT}`);
        console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1); // Exit with failure
  }
};

startServer();
