import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import authRoutes from './routes/authRoutes';
import categoryRoutes from './routes/categoryRoutes';
import newsletterRoutes from './routes/newsletterRoutes';
import productRoutes from './routes/productRoutes';

const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));

const app: Application = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = ['https://kelvisan-electrical-networks-ltd.vercel.app', 'http://localhost:3000'];
    console.log('CORS request from:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/', (_req: Request, res: Response) => {
  res.send('Kelvisan API is running...');
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'healthy' });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  if (err.message === 'CORS policy violation') {
    res.status(403).json({ message: 'CORS policy violation' });
  } else {
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : undefined
    });
  }
});

export default app;