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
// IMPORTANT: Ensure the origin matches your frontend's deployed URL exactly, without a trailing slash.
app.use(cors({
  origin: ['https://kelvisan-electrical-networks-ltd.vercel.app', 'http://localhost:3000'], // Removed trailing slash from Vercel URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Explicitly allow methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly allow headers
  credentials: true // If you're sending cookies or authorization headers with credentials
}));


// Body parsers
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: true })); // for form submissions

// Serve uploaded images statically (Keeping this in case you have old local uploads,
// but new uploads will go to Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- API ROUTES ---

app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/category', categoryRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.send('Kelvisan API is running...');
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;