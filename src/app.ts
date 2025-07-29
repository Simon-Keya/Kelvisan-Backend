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

// Load environment variables from .env file (important for Cloudinary credentials and other configs)
// This is done here as well, but primarily handled in server.ts as the entry point.
dotenv.config();

// Load Swagger docs
// Ensure the path to swagger.yaml is correct relative to where the built JS runs (dist folder)
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

const app: Application = express();

// --- MIDDLEWARES ---

// Configure CORS
// IMPORTANT: Ensure the origin matches your frontend's deployed URL exactly, without a trailing slash.
app.use(cors({
  origin: ['https://kelvisan-electrical-networks-ltd.vercel.app', 'http://localhost:3000'], // Removed trailing slash from Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers
  credentials: true // If you're sending cookies or authorization headers with credentials
}));

// Body parsers
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: true })); // for form submissions (e.g., from HTML forms or URL-encoded data)

// Serve uploaded images statically (Keeping this in case you have old local uploads,
// but new uploads will go to Cloudinary. Adjust path if 'uploads' is not directly in root)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- API ROUTES ---

app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
// --- IMPORTANT CHANGE HERE: Use '/api/categories' for RESTful consistency ---
app.use('/api/categories', categoryRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check / Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.send('Kelvisan API is running...');
});

// Global error handler
// This catches errors that are not handled by specific route/middleware try-catch blocks
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err); // Log the full error for debugging
  // You might want to send different error messages based on NODE_ENV for security
  res.status(500).json({
    message: 'Internal server error',
    // In development, you might send more error details
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

export default app;