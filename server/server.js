const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const apiRoutes = require('./routes/api');

const app = express();

// Security and Parsing Middlewares
app.use(cors({
  origin: config.allowedOrigin === '*' ? true : config.allowedOrigin,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// API Routes
app.use('/api', apiRoutes);

// Fallback for client-side single-page app
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(publicDir, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found.' });
  }
  next();
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: config.isProduction ? 'An unexpected server error occurred.' : (err.message || 'Server error')
  });
});

const PORT = config.port;
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 NoticeSense AI Platform running on http://localhost:${PORT}`);
  console.log(`🤖 Gemini API Key: ${config.hasGeminiKey ? 'Configured ✅' : 'Not set (add to .env) ⚠️'}`);
  console.log(`💾 Storage: ${config.hasSupabase ? 'Supabase PostgreSQL ✅' : 'Local JSON Store (fallback) ✅'}`);
  console.log(`===============================================`);
});

module.exports = { app, server };
