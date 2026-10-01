"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../services/db");
const router = (0, express_1.Router)();
// Seed Challenges helper
const seedChallengesIfEmpty = async () => {
    const count = await db_1.prisma.dailyChallenge.count();
    if (count > 0)
        return;
    const defaultChallenges = [
        {
            title: "The Paradox of the Two Guards",
            difficulty: "medium",
            difficultyLabel: "Medium Difficulty",
            xp: 20,
            pts: 10,
            text: "You stand before two doors. One door leads to absolute victory, the other to immediate academic failure. Each door is guarded by a sentinel. One always speaks the absolute truth; the other always lies. You do not know which sentinel is which. You can ask exactly one question to one of the sentinels. What question leads you to victory?",
            options: JSON.stringify([
                { text: "Ask: 'Which door would the other guard say is the winner?' and take the opposite." },
                { text: "Ask: 'Are you the liar?' and walk through the door behind him." },
                { text: "Ask: 'Does 2 + 2 equal 4?' then take the door behind him." },
                { text: "Flip a coin. The probability is 50-50, which is the maximum solvable threshold anyway." }
            ]),
            correctOptionIndex: 0,
            successMsg: "Bazinga! Exactly. The liar will lie about the truth-teller's honest answer, and the truth-teller will honestly tell you the liar's lie. In both cases, asking what the OTHER would say results in a lie, so taking the opposite door guarantees victory. An elegant binary operation.",
            failMsg: "No, no, no. That question resolves nothing. If you ask the liar if he is the liar, he will lie and say 'No'. If you ask the truth-teller, he will say 'No'. You have extracted zero binary information. Think before you choose!"
        },
        {
            title: "The Three Light Switches",
            difficulty: "easy",
            difficultyLabel: "Easy Difficulty",
            xp: 10,
            pts: 5,
            text: "In an attic, there are three light switches in the 'off' position. Only one switch controls a single incandescent light bulb in the basement. You cannot see the basement light from the attic. You are allowed to manipulate the switches as much as you like, but you can only make one trip down to the basement. How do you identify the correct switch?",
            options: JSON.stringify([
                { text: "Turn switch 1 on for 10 minutes, turn it off, turn switch 2 on, go down and feel if the bulb is warm." },
                { text: "Turn switches 1 and 2 on, go down, and guess between the two if it is lit." },
                { text: "Leave all switches off. The bulb is Schrödinger's bulb, existing in a superposition of on and off." },
                { text: "Ask a roommate to go down. Delegate tasks to lesser minds." }
            ]),
            correctOptionIndex: 0,
            successMsg: "Correct! By leaving switch 1 on, the bulb generates thermal dissipation. Feeling the bulb's temperature tells you if switch 1 was the cause, even if it is currently off. Thermodynamics solves what light waves cannot.",
            failMsg: "Highly illogical. Guessing represents a 50% failure rate. We do not gamble in science. Use thermodynamics!"
        },
        {
            title: "The Ship of Theseus Logic",
            difficulty: "hard",
            difficultyLabel: "Hard Difficulty",
            xp: 30,
            pts: 15,
            text: "A wooden ship has all its planks replaced one by one over decades until no original wood remains. Simultaneously, the old planks are gathered and reassembled into a second ship. Which ship is the original Ship of Theseus?",
            options: JSON.stringify([
                { text: "Neither. Identity is a psychological construct, not a physical property." },
                { text: "The ship with the replaced planks, since the structural pattern remained continuous." },
                { text: "The ship reassembled from the old planks, since it has material continuity." },
                { text: "Both. It represents a semantic ambiguity of the word 'original' rather than a physical paradox." }
            ]),
            correctOptionIndex: 3,
            successMsg: "Exquisite. You avoided the category mistake. The paradox is not a mystery of physical laws, but an illustration that the linguistic term 'identity' can refer to either formal configuration or material constitution simultaneously. Precision in terminology is vital.",
            failMsg: "Incorrect. Selecting one over the other ignores the fundamental linguistic trap of the question. You must audit your cognitive semantic compiler."
        }
    ];
    for (const c of defaultChallenges) {
        await db_1.prisma.dailyChallenge.create({ data: c });
    }
};
// 1. Get Current Challenge
router.get('/', async (req, res) => {
    try {
        await seedChallengesIfEmpty();
        const challenges = await db_1.prisma.dailyChallenge.findMany();
        // Choose challenge based on day of year to mimic "daily" behavior
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000);
        const dailyIdx = dayOfYear % challenges.length;
        const challenge = challenges[dailyIdx];
        // Return parsed options
        res.json({
            id: challenge.id,
            title: challenge.title,
            difficulty: challenge.difficulty,
            difficultyLabel: challenge.difficultyLabel,
            xp: challenge.xp,
            pts: challenge.pts,
            text: challenge.text,
            options: JSON.parse(challenge.options)
        });
    }
    catch (error) {
        console.error("Get Challenge Error:", error);
        res.status(500).json({ error: "Failed to load daily logic challenge." });
    }
});
// 2. Verify Option Selected
router.post('/verify', async (req, res) => {
    const { challengeId, selectedOptionIndex } = req.body;
    const authHeader = req.headers['authorization'];
    if (!challengeId || selectedOptionIndex === undefined) {
        return res.status(400).json({ error: "Challenge ID and selected option index are required." });
    }
    try {
        const challenge = await db_1.prisma.dailyChallenge.findUnique({
            where: { id: challengeId }
        });
        if (!challenge) {
            return res.status(404).json({ error: "Challenge not found." });
        }
        const isCorrect = challenge.correctOptionIndex === selectedOptionIndex;
        let userStats = null;
        if (isCorrect && authHeader) {
            // Decode user and update XP
            try {
                const jwt = require('jsonwebtoken');
                const token = authHeader.split(' ')[1];
                const decoded = jwt.decode(token);
                if (decoded && decoded.id) {
                    const user = await db_1.prisma.user.findUnique({ where: { id: decoded.id } });
                    if (user) {
                        const newXp = user.xp + challenge.xp;
                        const newScore = user.score + challenge.pts;
                        let newLevel = user.level;
                        if (newXp >= 1500)
                            newLevel = 'Nobel Candidate';
                        else if (newXp >= 800)
                            newLevel = 'Genius';
                        else if (newXp >= 500)
                            newLevel = 'Scientist';
                        else if (newXp >= 250)
                            newLevel = 'Analyst';
                        else if (newXp >= 100)
                            newLevel = 'Thinker';
                        const updated = await db_1.prisma.user.update({
                            where: { id: user.id },
                            data: {
                                xp: newXp,
                                score: newScore,
                                level: newLevel,
                                streak: user.streak // Can be incremented optionally
                            }
                        });
                        userStats = {
                            xp: updated.xp,
                            score: updated.score,
                            level: updated.level,
                            streak: updated.streak
                        };
                    }
                }
            }
            catch (e) {
                console.error("XP verification award failure:", e);
            }
        }
        res.json({
            isCorrect,
            feedbackMsg: isCorrect ? challenge.successMsg : challenge.failMsg,
            userStats
        });
    }
    catch (error) {
        console.error("Verify Challenge Error:", error);
        res.status(500).json({ error: "Logic verification subroutines failed." });
    }
});
exports.default = router;
