'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Scale, PlusCircle, MinusCircle, ShieldAlert, Cpu } from 'lucide-react';

interface DebateData {
  pro: string[];
  con: string[];
  conclusion: string;
}

export default function Debate() {
  const { token, updateUserStatsState } = useAuth();
  
  const [thesis, setThesis] = useState('');
  const [loading, setLoading] = useState(false);
  const [debate, setDebate] = useState<DebateData | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleDebate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!thesis.trim()) return;

    setLoading(true);
    setDebate(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/sheldon/debate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ thesis })
      });

      const data = await res.json();
      if (res.ok) {
        setDebate(data.debate);
        
        // Update user stats
        if (data.userStats) {
          updateUserStatsState(data.userStats);
        }
      } else {
        alert(data.error || "Failed to analyze thesis.");
      }
    } catch (err) {
      alert("Failed to connect to Sheldon debate core. Please verify your server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-6xl w-full mx-auto">
      {/* Header */}
      <div className="border-b border-[#00f0ff]/15 pb-4">
        <div className="flex items-center gap-3">
          <Scale className="w-6 h-6 text-[#00f0ff]" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Thesis Debate Chamber</h2>
            <p className="text-xs text-[#94a3b8]">Deconstruct claims using formal logic frameworks.</p>
          </div>
        </div>
      </div>

      {/* Input Thesis */}
      <div className="glass-card p-5 relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent"></div>
        <form onSubmit={handleDebate} className="flex flex-col gap-3">
          <label className="text-[0.7rem] font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
            Submit Claim for Logical Dissection
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={thesis}
              onChange={(e) => setThesis(e.target.value)}
              className="flex-1 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#64748b] focus:border-[#00f0ff] outline-none transition-all"
              placeholder="e.g. Space exploration is a waste of capital resources."
              disabled={loading}
              required
            />
            <button
              type="submit"
              disabled={loading || !thesis.trim()}
              className="flex items-center justify-center gap-2 py-2.5 px-6 bg-[#00f0ff] text-[#050814] hover:bg-[#00c8d6] hover:shadow-[0_0_12px_rgba(0,240,255,0.15)] rounded-lg text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
            >
              <Cpu className="w-4 h-4" />
              <span>Deconstruct</span>
            </button>
          </div>
        </form>
      </div>

      {/* Loading and Results panel */}
      <div className="min-h-[300px] flex flex-col justify-center">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-8 h-8 border-2 border-t-transparent border-[#00f0ff] rounded-full animate-spin"></div>
            <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest mt-2">
              Analyzing premises...
            </span>
          </div>
        )}

        {!loading && debate && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Pro Argument */}
            <div className="glass-card p-5 border-t-4 border-t-[#bd00ff] flex flex-col gap-4">
              <div className="flex items-center gap-2 font-mono font-bold text-[0.85rem] text-[#bd00ff] uppercase">
                <PlusCircle className="w-4 h-4" />
                <span>Proponent Logics (Supporting Thesis)</span>
              </div>
              <ul className="flex flex-col gap-3 text-xs md:text-sm text-[#94a3b8] leading-relaxed">
                {debate.pro.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-[#bd00ff] font-bold font-mono">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Con Argument */}
            <div className="glass-card p-5 border-t-4 border-t-[#ff9d00] flex flex-col gap-4">
              <div className="flex items-center gap-2 font-mono font-bold text-[0.85rem] text-[#ff9d00] uppercase">
                <MinusCircle className="w-4 h-4" />
                <span>Opponent Logics (Deconstructing Thesis)</span>
              </div>
              <ul className="flex flex-col gap-3 text-xs md:text-sm text-[#94a3b8] leading-relaxed">
                {debate.con.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-[#ff9d00] font-bold font-mono">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sheldon Synthesis */}
            <div className="glass-card p-5 md:col-span-2 border-l-4 border-l-[#00f0ff] flex flex-col gap-2">
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#00f0ff] uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Logical Synthesis & Conclusion</span>
              </div>
              <p className="text-xs md:text-sm leading-relaxed text-[#f8fafc]">
                {debate.conclusion}
              </p>
            </div>
          </div>
        )}

        {!loading && !debate && (
          <div className="flex flex-col items-center justify-center text-center p-8 text-[#64748b]">
            <Scale className="w-12 h-12 mb-4 text-[#00f0ff]/10" />
            <h4 className="text-[#94a3b8] font-semibold mb-1">Awaiting Hypothesis Submit</h4>
            <p className="text-xs max-w-xs leading-relaxed">
              State your claim above. Dr. Logic will isolate the variables and evaluate the rational coefficients.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
