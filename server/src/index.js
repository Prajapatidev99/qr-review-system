const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const config = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Route imports
const authRoutes = require('./routes/auth');
const businessRoutes = require('./routes/businesses');
const scanRoutes = require('./routes/scans');
const feedbackRoutes = require('./routes/feedbacks');
const analyticsRoutes = require('./routes/analytics');
const suggestionRoutes = require('./routes/suggestions');

const app = express();

// ─── Security & Parsing ───────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl) or any localhost/dev origin
    if (!origin || config.nodeEnv === 'development' || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(null, config.corsOrigin);
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting ────────────────────────────────────────
app.use('/api', apiLimiter);

// ─── Health Check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ─── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/feedbacks', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/suggestions', suggestionRoutes);

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────
const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   QR Review System — API Server              ║
║   Port: ${config.port}                              ║
║   Environment: ${config.nodeEnv.padEnd(29)}║
║   Database: MongoDB                          ║
╚══════════════════════════════════════════════╝
    `);
  });
};

startServer();
