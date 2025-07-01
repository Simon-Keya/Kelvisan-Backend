import cors from 'cors';
import express, { Application } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Import routes
import authRoutes from './routes/authRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import productRoutes from './routes/productRoutes';

// Load Swagger docs
const swaggerDocument = YAML.load('./docs/swagger.yaml');

const app: Application = express();

// --- MIDDLEWARES ---

// Enable CORS for frontend (adjust origin as needed)
app.use(cors({
  origin: 'https://kelvisan-electrical-networks-ltd.vercel.app/',
  credentials: true,
}));

// Body parsers
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: true })); // for form submissions

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --- API ROUTES ---

app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/', (_req, res) => {
  res.send('Kelvisan API is running...');
});

// Global error handler (optional but recommended)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
