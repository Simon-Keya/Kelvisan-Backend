import dotenv from 'dotenv';
import app from './app';
import { initializeDatabase } from './models/db';

     dotenv.config();

     const PORT = parseInt(process.env.PORT || '10000', 10);

     const startServer = async () => {
       try {
         await initializeDatabase();
         console.log('✅ Database connected successfully');

         const server = app.listen(PORT, () => {
           console.log(`✅ Server running on port ${PORT}`);
           console.log(`Environment PORT: ${process.env.PORT}`);
           if (process.env.NODE_ENV !== 'production') {
             console.log(`🔗 Local API: http://localhost:${PORT}`);
             console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
           }
         });

         // Log other signals for debugging
         process.on('SIGINT', () => {
           console.log('Received SIGINT. Server is still running...');
         });
         process.on('SIGUSR1', () => {
           console.log('Server is still running...');
         });
         process.on('SIGUSR2', () => {
           console.log('Received SIGUSR2. Server is still running...');
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