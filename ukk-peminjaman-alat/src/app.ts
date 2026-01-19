import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import sequelize from './config/database';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import alatRoutes from './routes/alatRoutes';
import kategoriRoutes from './routes/kategoriRoutes';
import peminjamanRoutes from './routes/peminjamanRoutes';
import pengembalianRoutes from './routes/pengembalianRoutes';
import logRoutes from './routes/logRoutes';
import laporanRoutes from './routes/laporanRoutes';

// Import error handler
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3002;

// ✅ Ambil daftar origin dari .env
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

// Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // izinkan request tanpa origin (misalnya dari curl/postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alat', alatRoutes);
app.use('/api/kategori', kategoriRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/pengembalian', pengembalianRoutes);
app.use('/api/log', logRoutes);
app.use('/api/laporan', laporanRoutes);

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // // Sync models (development only)
    // if (process.env.NODE_ENV === 'development') {
    //   await sequelize.sync({ alter: true });
    //   console.log('✅ Database models synchronized');
    // }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

startServer();

export default app;