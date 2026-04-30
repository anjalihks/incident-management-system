const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const signalRoutes = require('./routes/signal.routes');

const app = express();

// 🔥 VERY IMPORTANT: CORS must be BEFORE routes
app.use(cors());

// Middleware
app.use(express.json());
app.use('/api/signals', signalRoutes);

// Rate limiter
const ingestLimiter = rateLimit({
  windowMs: 1000,
  max: 10,
  message: {
    error: "Too many requests, slow down"
  }
});

// Routes
const ingestRoutes = require('./routes/ingest.routes');
const incidentRoutes = require('./routes/incident.routes');
const metricsRoutes = require('./routes/metrics.routes');

// Apply limiter only to ingest
app.use('/api/ingest', ingestLimiter);

// Route mounting
app.use('/api', ingestRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/metrics', metricsRoutes);

// Health
app.get('/health', (req, res) => {
  res.json({ status: "OK" });
});

// Ready
app.get('/ready', (req, res) => {
  res.json({
    redis: "connected",
    mongo: "connected",
    postgres: "connected"
  });
});

module.exports = app;