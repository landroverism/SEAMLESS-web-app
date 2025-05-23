const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');
const clientRoutes = require('./routes/clients.routes');
const orderRoutes = require('./routes/orders.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const analyticsRoutes = require('./routes/analytics.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Tailorly API is running' });
});

// Supabase connection test
app.get('/api/test-supabase', async (req, res) => {
  try {
    const { supabase } = require('./services/supabase.service');
    
    // Test auth functionality
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    // Test database access
    const { data, error } = await supabase.from('tailors').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to connect to Supabase', 
        error: error.message 
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Successfully connected to Supabase',
      data
    });
  } catch (err) {
    console.error('Supabase test error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Error testing Supabase connection',
      error: err.message 
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Start the server - try the specified port, or use an alternative if busy
const startServer = (port) => {
  // Ensure port is a number and within valid range
  port = parseInt(port, 10);
  if (isNaN(port) || port < 1024 || port > 65535) {
    port = 3000; // Default to 3000 if invalid
  }
  
  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    // Update environment variable to reflect actual port
    process.env.PORT = port;
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      // Try next port, but ensure it's within valid range
      const nextPort = port + 1;
      if (nextPort <= 65535) {
        console.log(`Port ${port} is busy, trying port ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('No available ports found in valid range');
      }
    } else {
      console.error('Server error:', err);
    }
  });
  return server;
};

startServer(PORT);

module.exports = app;
