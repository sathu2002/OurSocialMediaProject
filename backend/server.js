require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedDefaultUsers = require('./utils/seedDefaultUsers');

const app = express();

const validateEnvironment = () => {
  const missing = [];

  if (!process.env.MONGO_URI) {
    missing.push('MONGO_URI');
  }

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    missing.push('JWT_SECRET (min 16 chars)');
  }

  if (missing.length > 0) {
    throw new Error(`Missing or invalid environment variables: ${missing.join(', ')}`);
  }
};

// Middleware
// Enable CORS for frontend and mobile apps
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:8081', 'http://192.168.103.203:8081', 'http://192.168.103.203:5000', '*'],
  credentials: true 
}));

// JSON body parser with limit 10mb
app.use(express.json({ limit: '10mb' }));

// Placeholder route for testing
app.get('/', (req, res) => {
  res.send('Welcome to the API.');
});

// Mount routes will go here
// --- ROUTE IMPORTS ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDB();
    await seedDefaultUsers();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
