import { Router, Response } from 'express';
import { AIService } from '../services/aiService';
import { prisma } from '../services/db';
import { authenticateToken, AuthRequest } from '../middlewares/authMiddleware';

const router = Router();

// Helper to reward XP and update stats
const rewardUserXP = async (userId: string, xpAmount: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  const newXp = user.xp + xpAmount;
  const newScore = user.score + Math.floor(xpAmount / 2);
  
  // Level threshold boundaries
  let newLevel = user.level;
  if (newXp >= 1500) newLevel = 'Nobel Candidate';
  else if (newXp >= 800) newLevel = 'Genius';
  else if (newXp >= 500) newLevel = 'Scientist';
  else if (newXp >= 250) newLevel = 'Analyst';
  else if (newXp >= 100) newLevel = 'Thinker';

  return await prisma.user.update({
    where: { id: userId },
    data: { xp: newXp, score: newScore, level: newLevel }
  });
};

// 1. Natural Logic Chat
router.post('/chat', async (req: AuthRequest, res) => {
  const { history, message } = req.body;
  const authHeader = req.headers['authorization'];
  
  if (!message) {
    return res.status(400).json({ error: "Message content cannot be blank." });
  }

  try {
    const reply = await AIService.generateChatResponse(history || [], message);
    
    // Optionally check if token is provided to award XP
    let userStats = null;
    if (authHeader) {
      // Decode user without blocking if invalid
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.id) {
          const updated = await rewardUserXP(decoded.id, 5); // +5 XP per message
          if (updated) {
            userStats = {
              xp: updated.xp,
              score: updated.score,
              level: updated.level,
              streak: updated.streak
            };
          }
        }
      } catch (e) {
        // Suppress auth error since chat is public-facing
      }
    }

    res.json({ reply, userStats });
  } catch (error) {
    console.error("Chat route error:", error);
    res.status(500).json({ error: "Cognitive failure inside chat routing." });
  }
});

// 2. Evaluate Idea Engine
router.post('/evaluate', async (req: AuthRequest, res) => {
  const { title, description, category, brutal } = req.body;
  const authHeader = req.headers['authorization'];

  if (!title || !description || !category) {
    return res.status(400).json({ error: "Title, description, and category parameters are required." });
  }

  try {
    const analysis = await AIService.evaluateIdea(title, description, category, brutal === true);

    let dbEvaluationId = null;
    let userStats = null;

    if (authHeader) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.id) {
          // Save Evaluation to DB
          const savedEval = await prisma.evaluation.create({
            data: {
              title,
              description,
              category,
              feasibility: analysis.feasibility,
              innovation: analysis.innovation,
              marketPotential: analysis.marketPotential,
              complexity: analysis.complexity,
              verdict: analysis.verdict,
              swotS: JSON.stringify(analysis.swotS),
              swotW: JSON.stringify(analysis.swotW),
              swotO: JSON.stringify(analysis.swotO),
              swotT: JSON.stringify(analysis.swotT),
              failures: JSON.stringify(analysis.failures),
              improvements: JSON.stringify(analysis.improvements),
              userId: decoded.id
            }
          });
          dbEvaluationId = savedEval.id;

          // Award +25 XP
          const updated = await rewardUserXP(decoded.id, 25);
          if (updated) {
            userStats = {
              xp: updated.xp,
              score: updated.score,
              level: updated.level,
              streak: updated.streak
            };
          }
        }
      } catch (e) {
        console.error("Evaluation auth linking error:", e);
      }
    }

    res.json({ analysis, dbEvaluationId, userStats });
  } catch (error) {
    console.error("Evaluation route error:", error);
    res.status(500).json({ error: "Evaluation engine operational crash." });
  }
});

// 3. Deep Lecture Generation
router.post('/lecture', async (req: AuthRequest, res) => {
  const { topic, level, duration } = req.body;
  const authHeader = req.headers['authorization'];
  const minutes = parseInt(duration) || 30;

  if (!topic || !level) {
    return res.status(400).json({ error: "Topic and level are required parameters." });
  }

  try {
    const lecture = await AIService.generateLecture(topic, level, minutes);
    
    let userStats = null;
    if (authHeader) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.id) {
          const updated = await rewardUserXP(decoded.id, 30); // +30 XP for deep lectures
          if (updated) {
            userStats = {
              xp: updated.xp,
              score: updated.score,
              level: updated.level,
              streak: updated.streak
            };
          }
        }
      } catch (e) {}
    }

    res.json({ lecture, userStats });
  } catch (error) {
    console.error("Lecture route error:", error);
    res.status(500).json({ error: "Lecture compiling engine failure." });
  }
});

// 4. Debate Mode Analysis
router.post('/debate', async (req: AuthRequest, res) => {
  const { thesis } = req.body;
  const authHeader = req.headers['authorization'];

  if (!thesis) {
    return res.status(400).json({ error: "Thesis cannot be blank." });
  }

  try {
    const debate = await AIService.generateDebate(thesis);

    let userStats = null;
    if (authHeader) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.id) {
          const updated = await rewardUserXP(decoded.id, 15); // +15 XP for deconstructing thesis
          if (updated) {
            userStats = {
              xp: updated.xp,
              score: updated.score,
              level: updated.level,
              streak: updated.streak
            };
          }
        }
      } catch (e) {}
    }

    res.json({ debate, userStats });
  } catch (error) {
    console.error("Debate route error:", error);
    res.status(500).json({ error: "Debate routing engine crash." });
  }
});

// 5. Update/Save OpenAI API Key dynamically
router.post('/settings/key', async (req, res) => {
  const { apiKey } = req.body;
  
  if (apiKey === undefined) {
    return res.status(400).json({ error: "apiKey is a required parameter." });
  }

  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(__dirname, '../../.env');
    
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      if (envContent.includes('OPENAI_API_KEY=')) {
        envContent = envContent.replace(/OPENAI_API_KEY=.*/, `OPENAI_API_KEY="${apiKey}"`);
      } else {
        envContent += `\nOPENAI_API_KEY="${apiKey}"`;
      }
    } else {
      envContent = `DATABASE_URL="file:./dev.db"\nJWT_SECRET="super-secret-key-sheldon-314159"\nOPENAI_API_KEY="${apiKey}"\nPORT=5000\n`;
    }
    
    fs.writeFileSync(envPath, envContent, 'utf8');
    
    // Refresh memory env
    process.env.OPENAI_API_KEY = apiKey;
    const { initOpenAI } = require('../services/aiService');
    initOpenAI(apiKey);

    res.json({ success: true, message: "OpenAI API Key successfully synced and loaded." });
  } catch (error) {
    console.error("Save API Key Error:", error);
    res.status(500).json({ error: "Failed to persist API Key configuration." });
  }
});

export default router;
