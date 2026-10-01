'use client';

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  BrainCircuit, 
  BarChart3, 
  ShieldAlert, 
  CheckCircle2, 
  Shield, 
  AlertCircle, 
  TrendingUp, 
  Zap, 
  Skull, 
  Wrench, 
  Bookmark, 
  Cpu 
} from 'lucide-react';

interface EvaluationData {
  feasibility: number;
  innovation: number;
  marketPotential: number;
  complexity: number;
  verdict: string;
  swotS: string[];
  swotW: string[];
  swotO: string[];
  swotT: string[];
  failures: string[];
  improvements: string[];
}

export default function Evaluator() {
  const { token, updateUserStatsState } = useAuth();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('aerospace');
  const [desc, setDesc] = useState('');
  const [brutal, setBrutal] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [report, setReport] = useState<EvaluationData | null>(null);
  const [dbEvalId, setDbEvalId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const runEvaluation = async () => {
    if (!title.trim() || !desc.trim()) {
      alert("Please specify a Concept Title and a Technical Description.");
      return;
    }

    setLoading(true);
    setReport(null);
    setDbEvalId(null);
    setSaved(false);

    // Simulate loading steps in UI
    const steps = [
      "Parsing mechanical equations...",
      "Analyzing scaling bounds...",
      "Executing SWOT logic arrays...",
      "Formulating logical verdict..."
    ];

    let currentStep = 0;
    setLoadingStep(steps[0]);

    const stepInterval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setLoadingStep(steps[currentStep]);
      } else {
        clearInterval(stepInterval);
      }
    }, 700);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/sheldon/evaluate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title, description: desc, category, brutal })
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (res.ok) {
        setReport(data.analysis);
        setDbEvalId(data.dbEvaluationId);
        
        // Update user stats
        if (data.userStats) {
          updateUserStatsState(data.userStats);
        }
      } else {
        alert(data.error || "Failed to compile evaluation.");
      }
    } catch (err) {
      clearInterval(stepInterval);
      alert("Failed to connect to Sheldon core. Please verify your server port is online.");
    } finally {
      setLoading(false);
    }
  };

  const saveToVault = async () => {
    if (!report || !token) {
      alert("You must be signed in to save evaluations to the vault.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/vault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Audit: ${title}`,
          content: report.verdict,
          type: 'evaluation',
          previewText: `Feasibility: ${report.feasibility}% | Complexity: ${report.complexity}%`,
          tags: `${category}, Audit`
        })
      });

      if (res.ok) {
        setSaved(true);
        alert("Evaluation synced to your Knowledge Vault.");
      } else {
        alert("Failed to save evaluation to vault.");
      }
    } catch (err) {
      alert("Network failure saving to vault.");
    }
  };

  // Helper for circular stroke progress offsets
  const getOffset = (score: number) => {
    const r = 30;
    const circ = 2 * Math.PI * r;
    return circ - (score / 100) * circ;
  };

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Header */}
      <div className="border-b border-[#00f0ff]/15 pb-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-6 h-6 text-[#00f0ff]" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Idea Evaluation Engine</h2>
            <p className="text-xs text-[#94a3b8]">AI Sheldon: Think Before You Build.</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
        
        {/* Form Panel */}
        <div className="glass-card p-6 flex flex-col gap-5 relative">
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
            Concept Parameters
          </h3>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
              Concept Title
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg text-sm text-white focus:border-[#00f0ff] outline-none transition-all"
              placeholder="e.g. Supersonic Passenger Drone Network"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
              Technological Domain
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg text-sm text-white focus:border-[#00f0ff] outline-none transition-all"
            >
              <option value="aerospace">Aerospace & Flight Mechanics</option>
              <option value="energy">Energy & Battery Chemistry</option>
              <option value="software">Distributed Systems & AI Architecture</option>
              <option value="biotech">Biomedical & Synthetic Biology</option>
              <option value="consumer">Consumer Hardware & Operations</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
              Technical Specification & Assumptions
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full px-4 py-2.5 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg text-sm text-white focus:border-[#00f0ff] outline-none transition-all min-h-[140px] resize-y"
              placeholder="Describe the physics, scaling properties, market sizing constraints, and core hypotheses..."
            />
          </div>

          {/* Brutal Honesty Toggle */}
          <div className="flex items-center justify-between p-4 bg-red-500/5 border border-red-500/15 rounded-lg">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#ff3131]">Brutally Honest Audit</span>
              <span className="text-xs text-[#94a3b8]">Enable uncompromising logical stress-testing.</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={brutal}
                onChange={() => setBrutal(!brutal)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff3131]"></div>
            </label>
          </div>

          <button
            onClick={runEvaluation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#00f0ff] text-[#050814] hover:bg-[#00c8d6] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-lg text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
          >
            <Cpu className="w-4 h-4" />
            <span>Initialize Logic Verification</span>
          </button>
        </div>

        {/* Results Workspace */}
        <div className="glass-card p-6 flex flex-col gap-6 min-h-[480px]">
          {/* Default Placeholder */}
          {!loading && !report && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#94a3b8]">
              <BarChart3 className="w-12 h-12 mb-4 text-[#00f0ff]/20" />
              <h4 className="text-white font-semibold mb-2">Awaiting Parameter Submission</h4>
              <p className="text-xs max-w-sm leading-relaxed">
                Provide concept details in the left panel. AI Sheldon will execute a SWOT analysis, calculate feasibility coefficients, and deliver a verdict.
              </p>
            </div>
          )}

          {/* Loading panel */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 text-center">
              <div className="relative w-16 h-16">
                <div className="absolute w-3 h-3 rounded-full bg-[#00f0ff] animate-dna-node-1 left-[26px]"></div>
                <div className="absolute w-3 h-3 rounded-full bg-[#bd00ff] animate-dna-node-2 left-[26px]"></div>
              </div>
              <p className="font-mono text-sm text-white tracking-widest uppercase">
                Running logical audit...
              </p>
              <div className="text-xs text-[#00f0ff] min-h-[20px] font-mono">
                {loadingStep}
              </div>
            </div>
          )}

          {/* Report layout */}
          {report && (
            <div className="flex flex-col gap-6">
              {/* Report Header */}
              <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#00f0ff]/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white leading-tight">Evaluation Report: {title}</h3>
                  <p className="text-[0.7rem] text-[#64748b] font-mono tracking-wider mt-1">
                    {category.toUpperCase()} DOMAIN • AUDITED LIVE
                  </p>
                </div>
                {token && (
                  <button
                    onClick={saveToVault}
                    disabled={saved}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-[#00f0ff]/15 hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 rounded-lg text-xs font-semibold cursor-pointer text-white transition-all disabled:opacity-50"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-[#00f0ff]" />
                    <span>{saved ? "Synced" : "Save to Vault"}</span>
                  </button>
                )}
              </div>

              {/* Gauge Dashboard */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Feasibility", score: report.feasibility },
                  { label: "Innovation", score: report.innovation },
                  { label: "Market Pot.", score: report.marketPotential },
                  { label: "Complexity", score: report.complexity }
                ].map((item, index) => (
                  <div key={index} className="bg-white/2 border border-[#00f0ff]/10 rounded-xl p-3 flex flex-col items-center text-center gap-2">
                    <div className="relative w-16 h-16">
                      <svg className="w-full h-full -rotate-90">
                        <circle className="fill-none stroke-white/5" cx="32" cy="32" r="30" strokeWidth="4" />
                        <circle 
                          className="fill-none stroke-[#00f0ff] transition-all duration-1000" 
                          cx="32" cy="32" r="30" strokeWidth="4"
                          strokeDasharray={2 * Math.PI * 30}
                          strokeDashoffset={getOffset(item.score)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-mono font-bold text-sm text-white">
                        {item.score}%
                      </span>
                    </div>
                    <span className="text-[0.75rem] text-[#94a3b8] font-medium">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Verdict Card */}
              <div className={`border rounded-xl p-4 flex flex-col gap-2 ${
                brutal 
                  ? 'bg-red-500/3 border-red-500/20 text-[#f8fafc]' 
                  : 'bg-gradient-to-br from-[#00f0ff]/5 to-[#bd00ff]/3 border-[#00f0ff]/20'
              }`}>
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase">
                  {brutal ? (
                    <>
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">Verdict: Critical Operational Insufficiencies</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#00f0ff]" />
                      <span className="text-[#00f0ff]">Verdict: Pivotable Viability Path</span>
                    </>
                  )}
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-[#f8fafc]">
                  {report.verdict}
                </p>
              </div>

              {/* SWOT Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Strengths", items: report.swotS, border: "border-l-4 border-l-green-500 text-green-400", icon: Shield },
                  { title: "Weaknesses", items: report.swotW, border: "border-l-4 border-l-amber-500 text-amber-400", icon: AlertCircle },
                  { title: "Opportunities", items: report.swotO, border: "border-l-4 border-l-[#00f0ff] text-[#00f0ff]", icon: TrendingUp },
                  { title: "Threats", items: report.swotT, border: "border-l-4 border-l-red-500 text-red-400", icon: Zap }
                ].map((box, bIdx) => {
                  const BoxIcon = box.icon;
                  return (
                    <div key={bIdx} className={`bg-white/2 border border-[#00f0ff]/10 rounded-lg p-3 flex flex-col gap-2 ${box.border}`}>
                      <div className="flex items-center gap-2 font-mono font-bold text-[0.8rem] uppercase">
                        <BoxIcon className="w-4 h-4" />
                        <span>{box.title}</span>
                      </div>
                      <ul className="list-disc pl-4 flex flex-col gap-1 text-[0.75rem] text-[#94a3b8]">
                        {box.items.map((it, iIdx) => (
                          <li key={iIdx}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Failures & Improvements */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-[#00f0ff]/10 pt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#ff3131]">
                    <Skull className="w-4 h-4" />
                    <span>Potential Failure Points</span>
                  </div>
                  <ul className="list-decimal pl-4 flex flex-col gap-1.5 text-xs text-[#94a3b8]">
                    {report.failures.map((f, index) => (
                      <li key={index}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-green-400">
                    <Wrench className="w-4 h-4" />
                    <span>Recommended Adjustments</span>
                  </div>
                  <ul className="list-decimal pl-4 flex flex-col gap-1.5 text-xs text-[#94a3b8]">
                    {report.improvements.map((im, index) => (
                      <li key={index}>{im}</li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </main>
  );
}
