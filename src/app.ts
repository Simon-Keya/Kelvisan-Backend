import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Import routes
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import productRoutes from './routes/productRoutes';

// Load Swagger docs
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

const app: Application = express();

// --- MIDDLEWARES ---
app.use(cors({
  origin: ['https://kelvisan-electrical-networks-ltd.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically (comment out if using Cloudinary exclusively)
app.use('/uploads', express.static(path.join(__dirname, '..', 'Uploads')));

// --- API ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check / Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.send('Kelvisan API is running...');
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : undefined,
  });
});

export default app;