import cors from 'cors'; // Import the cors middleware
import dotenv from 'dotenv'; // Import dotenv to load environment variables
import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Import routes
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import productRoutes from './routes/productRoutes';

// Load environment variables from .env file (important for Cloudinary credentials)
dotenv.config();

// Load Swagger docs
const swaggerDocument = YAML.load('./docs/swagger.yaml');

const app: Application = express();

// --- MIDDLEWARES ---

// Configure CORS
// It's good that you have specific origins for production.
// For development, 'http://localhost:3000' is crucial.
app.use(cors({
  origin: ['https://kelvisan-electrical-networks-ltd.vercel.app', 'http://localhost:3000'], // Removed trailing slash from Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers
  credentials: true // If you're sending cookies or authorization headers with credentials
}));


// Body parsers
// These are for application/json and application/x-www-form-urlencoded
// Multer will handle multipart/form-data, so no changes needed here for that.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically (Keeping this in case you have old local uploads,
// but new uploads will go to Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- API ROUTES ---

app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes); // Ensure this matches your frontend endpoint '/api/category'

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.send('Kelvisan API is running...');
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  // In a real application, you might want to send more specific error messages
  // or use a dedicated error handling library.
  res.status(500).json({ message: 'Internal server error' });
});

export default app;