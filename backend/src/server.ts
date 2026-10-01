import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import Routes
import authRouter from './routes/auth';
import sheldonRouter from './routes/sheldon';
import vaultRouter from './routes/vault';
import challengesRouter from './routes/challenges';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity, can be locked down to NextJS frontend URL later
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// API Route Declarations
app.use('/api/auth', authRouter);
app.use('/api/sheldon', sheldonRouter);
app.use('/api/vault', vaultRouter);
app.use('/api/challenges', challengesRouter);

// Health Check Root
app.get('/api/health', (req, res) => {
  res.json({ status: "online", system: "AI Sheldon Central Core", timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandle System Error:", err);
  res.status(500).json({ error: "A fatal error occurred inside the logic gates of the server." });
});

// Start Server Listen
app.listen(PORT, () => {
  console.log(`[AI SHELDON SERVER] Online and listening on port http://localhost:${PORT}`);
});
