// server.js (root level)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import passport from 'passport'; // ✅ ADD

import config from './src/config/env.config.js';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/auth.routes.js';
import errorHandler from './src/middleware/errorHandler.js';

// ✅ LOAD PASSPORT CONFIG
import './src/config/passport.js';

const app = express();

// ================= DATABASE CONNECTION =================
await connectDB();

// ================= MIDDLEWARE =================
app.use(helmet());

app.use(cors({
  origin: config.server.frontendUrl,
  credentials: true
}));

// ✅ INITIALIZE PASSPORT
app.use(passport.initialize());

const limiter = rateLimit({
  windowMs: config.security.rateLimitWindow,
  max: config.security.rateLimitMax,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(mongoSanitize());

// ================= ROUTES =================
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    environment: config.server.env,
    database: 'connected'
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'PLM Backend API',
    version: '1.0.0',
    docs: '/api/docs',
    health: '/health'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

// ================= SERVER START =================
const PORT = config.server.port;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════╗
║           PLM Backend Server Started              ║
╠════════════════════════════════════════════════════╣
║  Environment: ${config.server.env.padEnd(37)} ║
║  Port:        ${PORT.toString().padEnd(37)} ║
║  API URL:     http://localhost:${PORT}/api${' '.repeat(17)} ║
║  Health:      http://localhost:${PORT}/health${' '.repeat(14)} ║
╚════════════════════════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

export default app;
