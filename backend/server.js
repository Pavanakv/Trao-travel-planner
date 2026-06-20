import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import tripRoutes from './routes/tripRoutes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '100kb' }));

// Generous general limiter so the API can't be hammered wholesale.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', generalLimiter);

// Tighter limiter on auth endpoints specifically - brute-force protection.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});
app.use('/api/auth', authLimiter);

// Trip creation/regeneration calls the LLM, which costs money per call -
// limit it separately so it can't be used to drive up API spend.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI generation requests. Please slow down.' },
});
app.use('/api/trips', (req, res, next) => {
  const isAiCall =
    (req.method === 'POST' && req.path === '/') ||
    /\/regenerate(-plan)?$/.test(req.path);
  return isAiCall ? aiLimiter(req, res, next) : next();
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// 404 for unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// Catch-all error handler (e.g. malformed JSON bodies land here)
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status === 400 ? 400 : 500;
  res.status(status).json({ message: status === 400 ? 'Malformed request body' : 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
