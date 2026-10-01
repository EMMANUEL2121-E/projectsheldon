"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../services/db");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-sheldon-314159';
// XP Levels helper
const determineLevel = (xp) => {
    if (xp >= 1500)
        return 'Nobel Candidate';
    if (xp >= 800)
        return 'Genius';
    if (xp >= 500)
        return 'Scientist';
    if (xp >= 250)
        return 'Analyst';
    if (xp >= 100)
        return 'Thinker';
    return 'Curious Mind';
};
// Generate JWT Helper
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
};
// 1. Email Registration
router.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required parameters." });
    }
    try {
        const existing = await db_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: "An account with this email address already exists." });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                xp: 20,
                level: 'Curious Mind',
                score: 10,
                streak: 1
            }
        });
        const token = generateToken(user);
        res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                xp: user.xp,
                level: user.level,
                score: user.score,
                streak: user.streak
            }
        });
    }
    catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ error: "Database transaction failure during registration." });
    }
});
// 2. Email Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required parameters." });
    }
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
            return res.status(400).json({ error: "Invalid credentials or account does not exist." });
        }
        const isValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(400).json({ error: "Invalid email credentials or incorrect password." });
        }
        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                xp: user.xp,
                level: user.level,
                score: user.score,
                streak: user.streak
            }
        });
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error during credential verification." });
    }
});
// 3. Google Single-Sign-On Auth Simulation
router.post('/google', async (req, res) => {
    const { email, googleId, name } = req.body;
    if (!email || !googleId || !name) {
        return res.status(400).json({ error: "Google authentication payload parameters missing." });
    }
    try {
        // Check if account with googleId exists
        let user = await db_1.prisma.user.findUnique({ where: { googleId } });
        if (!user) {
            // Check if email already registered via credentials
            const emailExisting = await db_1.prisma.user.findUnique({ where: { email } });
            if (emailExisting) {
                // Link googleId to existing account
                user = await db_1.prisma.user.update({
                    where: { email },
                    data: { googleId }
                });
            }
            else {
                // Create new account
                user = await db_1.prisma.user.create({
                    data: {
                        email,
                        googleId,
                        name,
                        xp: 20,
                        level: 'Curious Mind',
                        score: 10,
                        streak: 1
                    }
                });
            }
        }
        const token = generateToken(user);
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                xp: user.xp,
                level: user.level,
                score: user.score,
                streak: user.streak
            }
        });
    }
    catch (error) {
        console.error("Google Auth Error:", error);
        res.status(500).json({ error: "SSO database sync failure." });
    }
});
// 4. Retrieve User Stats (/me)
router.get('/me', authMiddleware_1.authenticateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized." });
    try {
        const user = await db_1.prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) {
            return res.status(404).json({ error: "User profile not found." });
        }
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            xp: user.xp,
            level: user.level,
            score: user.score,
            streak: user.streak
        });
    }
    catch (error) {
        res.status(500).json({ error: "Database retrieval failure." });
    }
});
// 5. Update User XP & Stats
router.post('/update-xp', authMiddleware_1.authenticateToken, async (req, res) => {
    if (!req.user)
        return res.status(401).json({ error: "Unauthorized." });
    const { amount } = req.body;
    const xpAmount = parseInt(amount);
    if (isNaN(xpAmount) || xpAmount <= 0) {
        return res.status(400).json({ error: "Amount must be a positive integer." });
    }
    try {
        const user = await db_1.prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return res.status(404).json({ error: "User not found." });
        const newXp = user.xp + xpAmount;
        const newScore = user.score + Math.floor(xpAmount / 2);
        const newLevel = determineLevel(newXp);
        const updatedUser = await db_1.prisma.user.update({
            where: { id: user.id },
            data: {
                xp: newXp,
                score: newScore,
                level: newLevel
            }
        });
        res.json({
            xp: updatedUser.xp,
            level: updatedUser.level,
            score: updatedUser.score,
            streak: updatedUser.streak
        });
    }
    catch (error) {
        console.error("Update XP Error:", error);
        res.status(500).json({ error: "Failed to update user XP matrix." });
    }
});
exports.default = router;
