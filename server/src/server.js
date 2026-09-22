import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/db.js';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import financialsRouter from './routes/financials.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Verify database connection is alive
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'Microloan and Repayment Tracker API is running smoothly',
      timestamp: new Date().toISOString(),
      database: 'Connected (SQLite via Prisma)',
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      error: error.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api', eventsRouter);
app.use('/api', financialsRouter);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Start server
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});

export default app;

