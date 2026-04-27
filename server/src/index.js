const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const logger = require('./utils/logger');
const { startCronJobs } = require('./utils/cronJobs');

// Route imports
const authRoutes = require('./routes/auth.routes');
const designRoutes = require('./routes/design.routes');
const partyRoutes = require('./routes/party.routes');
const stockRoutes = require('./routes/stock.routes');
const billRoutes = require('./routes/bill.routes');
const paymentRoutes = require('./routes/payment.routes');
const settingsRoutes = require('./routes/settings.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const reportRoutes = require('./routes/report.routes');

const app = express();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.CLIENT_URL,
      'https://khodalcreation.vercel.app',
      'https://www.khodalcreation.vercel.app'
    ].filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files - Cloudinary handles all uploads now
// No need for local file serving in production
if (process.env.NODE_ENV !== 'production') {
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/designs', designRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    // Don't exit on Vercel serverless - just log the error
    if (process.env.NODE_ENV !== 'production') process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  // Create upload directories only in development (Cloudinary handles production uploads)
  if (process.env.NODE_ENV !== 'production') {
    const fs = require('fs');
    const uploadBase = path.join(__dirname, '..', 'uploads');
    const dirs = [uploadBase, `${uploadBase}/designs`, `${uploadBase}/logos`, `${uploadBase}/temp`];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    startCronJobs();
  });
};

// On Vercel, export the app directly (serverless)
// Locally, start the server normally
if (process.env.NODE_ENV === 'production') {
  // Vercel: connect DB and start cron jobs (no file system operations needed)
  connectDB().then(() => {
    startCronJobs();
  });
} else {
  startServer();
}

module.exports = app;
