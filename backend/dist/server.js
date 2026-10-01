"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import Routes
const auth_1 = __importDefault(require("./routes/auth"));
const sheldon_1 = __importDefault(require("./routes/sheldon"));
const vault_1 = __importDefault(require("./routes/vault"));
const challenges_1 = __importDefault(require("./routes/challenges"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware Configuration
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for dev simplicity, can be locked down to NextJS frontend URL later
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// API Route Declarations
app.use('/api/auth', auth_1.default);
app.use('/api/sheldon', sheldon_1.default);
app.use('/api/vault', vault_1.default);
app.use('/api/challenges', challenges_1.default);
// Health Check Root
app.get('/api/health', (req, res) => {
    res.json({ status: "online", system: "AI Sheldon Central Core", timestamp: new Date() });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Unhandle System Error:", err);
    res.status(500).json({ error: "A fatal error occurred inside the logic gates of the server." });
});
// Start Server Listen
app.listen(PORT, () => {
    console.log(`[AI SHELDON SERVER] Online and listening on port http://localhost:${PORT}`);
});
