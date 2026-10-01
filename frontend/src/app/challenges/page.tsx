'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Puzzle, ArrowRight, Award, CheckCircle2, Lock, ShieldCheck, Glasses } from 'lucide-react';

interface Option {
  text: string;
}

interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  difficultyLabel: string;
  xp: number;
  pts: number;
  text: string;
  options: Option[];
}

export default function Challenges() {
  const { user, token, updateUserStatsState } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [verified, setVerified] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchChallenge = async () => {
    setLoading(true);
    setSelectedIdx(null);
    setVerified(false);
    setFeedback('');

    try {
      const res = await fetch(`${API_URL}/challenges`);
      const data = await res.json();
      if (res.ok) {
        setChallenge(data);
      }
    } catch (err) {
      console.error("Fetch challenge error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, []);

  const handleSelectOption = (idx: number) => {
    if (verified) return;
    setSelectedIdx(idx);
  };

  const verifyAnswer = async () => {
    if (selectedIdx === null || !challenge || verified) return;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/challenges/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          challengeId: challenge.id,
          selectedOptionIndex: selectedIdx
        })
      });

      const data = await res.json();
      if (res.ok) {
        setVerified(true);
        setCorrect(data.isCorrect);
        setFeedback(data.feedbackMsg);

        // Update live user stats/level/XP
        if (data.userStats) {
          updateUserStatsState(data.userStats);
        }
      }
    } catch (err) {
      alert("Failed to verify answer with server core.");
    }
  };

  // Achievement list definitions matching user ranks
  const achievements = [
    { name: "Curious Mind", desc: "Accumulated 10 XP. The journey into logic begins.", unlocked: true, icon: CheckCircle2 },
    { name: "Thinker (Level 2)", desc: "Reach 100 XP. Display mastery over basic logic.", unlocked: user ? user.xp >= 100 : false, icon: Award },
    { name: "Analyst (Level 3)", desc: "Reach 250 XP. Solve complex system failure paths.", unlocked: user ? user.xp >= 250 : false, icon: ShieldCheck },
    { name: "Genius (Level 6)", desc: "Reach 800 XP. Display outstanding intellectual rigor.", unlocked: user ? user.xp >= 800 : false, icon: Glasses },
  ];

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="border-b border-[#00f0ff]/15 pb-4">
        <div className="flex items-center gap-3">
          <Puzzle className="w-6 h-6 text-[#00f0ff]" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Logic Challenge Arena</h2>
            <p className="text-xs text-[#94a3b8]">Solve daily brain riddles and increase your IQ rankings.</p>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
        
        {/* Riddle Console */}
        <div className="glass-card p-6 flex flex-col gap-5 relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>
          
          {loading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="w-8 h-8 border-2 border-t-transparent border-[#00f0ff] rounded-full animate-spin"></div>
              <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest mt-2">
                Formatting riddle...
              </span>
            </div>
          )}

          {!loading && challenge && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center pb-3 border-b border-[#00f0ff]/10">
                <span className={`px-2.5 py-1 text-[0.7rem] font-mono font-bold rounded uppercase ${
                  challenge.difficulty === 'easy' 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                    : challenge.difficulty === 'medium'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {challenge.difficultyLabel}
                </span>
                <span className="text-xs font-mono text-[#00f0ff]">
                  +{challenge.xp} XP • +{challenge.pts} Pts
                </span>
              </div>

              <h3 className="text-lg font-bold text-white leading-snug">
                {challenge.title}
              </h3>
              
              <p className="text-sm md:text-base leading-relaxed text-[#94a3b8]">
                {challenge.text}
              </p>

              {/* Options */}
              <div className="flex flex-col gap-3 mt-2">
                {challenge.options.map((opt, idx) => {
                  const label = String.fromCharCode(65 + idx);
                  const isSelected = selectedIdx === idx;
                  
                  let optStyle = "bg-white/3 border-[#00f0ff]/15 hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/30";
                  if (isSelected) optStyle = "bg-[#00f0ff]/8 border-[#00f0ff]";
                  if (verified) {
                    if (isSelected && correct) optStyle = "bg-green-500/10 border-green-500 text-green-400";
                    else if (isSelected && !correct) optStyle = "bg-red-500/10 border-red-500 text-red-400";
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={verified}
                      className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg border text-left text-sm cursor-pointer transition-all ${optStyle}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs border ${
                        isSelected 
                          ? 'bg-[#00f0ff] border-[#00f0ff] text-[#050814]' 
                          : 'bg-[#050814]/50 border-[#00f0ff]/15 text-[#94a3b8]'
                      }`}>
                        {label}
                      </div>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Verify / Next Button */}
              {!verified ? (
                <button
                  onClick={verifyAnswer}
                  disabled={selectedIdx === null}
                  className="w-full py-3 bg-[#00f0ff] hover:bg-[#00c8d6] hover:shadow-[0_0_12px_rgba(0,240,255,0.2)] disabled:bg-[#00f0ff]/20 disabled:text-[#00f0ff]/50 disabled:cursor-not-allowed text-[#050814] font-bold rounded-lg text-sm transition-all cursor-pointer mt-3"
                >
                  <span>Submit Logical Deduction</span>
                </button>
              ) : (
                <div className="flex flex-col gap-4 mt-2">
                  <div className={`p-4 border rounded-lg flex flex-col gap-1 leading-relaxed ${
                    correct 
                      ? 'bg-green-500/5 border-green-500/20 text-[#f8fafc]' 
                      : 'bg-red-500/5 border-red-500/20 text-[#f8fafc]'
                  }`}>
                    <span className={`text-[0.75rem] font-mono font-bold uppercase ${correct ? 'text-green-400' : 'text-red-400'}`}>
                      {correct ? "LOGICAL EQUILIBRIUM RESOLVED" : "AUDIT FAILED: SYSTEM DECOHERENCE"}
                    </span>
                    <p className="text-xs md:text-sm mt-1">{feedback}</p>
                  </div>

                  <button
                    onClick={fetchChallenge}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 border border-[#00f0ff]/15 hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 text-white font-bold rounded-lg text-sm transition-all cursor-pointer"
                  >
                    <span>Load Next Challenge</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Intellectual Rankings */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Intellectual Rankings
          </h3>
          <div className="flex flex-col gap-3">
            {achievements.map((ach, idx) => {
              const Icon = ach.icon;
              return (
                <div 
                  key={idx}
                  className={`flex items-center gap-4 p-3 rounded-lg border bg-white/2 transition-all ${
                    ach.unlocked 
                      ? 'border-[#00f0ff]/30 text-white' 
                      : 'border-[#00f0ff]/10 opacity-50 text-[#64748b]'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                    ach.unlocked 
                      ? 'bg-[#00f0ff]/10 border-[#00f0ff]/30 text-[#00f0ff]' 
                      : 'bg-white/5 border-[#00f0ff]/10 text-[#64748b]'
                  }`}>
                    {ach.unlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold">{ach.name}</span>
                    <span className="text-[0.65rem] text-[#94a3b8] leading-tight">{ach.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
