import cors from 'cors';
import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Import routes
import authRoutes from './routes/authRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import productRoutes from './routes/productRoutes';

// Load Swagger docs
const swaggerDocument = YAML.load('./docs/swagger.yaml');

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);

// Swagger docs route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Basic health check
app.get('/', (_req, res) => {
  res.send('Kelvisan API is running...');
});

// Optional global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
