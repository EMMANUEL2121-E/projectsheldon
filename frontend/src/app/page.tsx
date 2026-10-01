'use client';

import React from 'react';
import Link from 'next/link';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  BrainCircuit, 
  MessagesSquare, 
  GraduationCap, 
  LineChart, 
  Scale, 
  Lightbulb, 
  Puzzle, 
  Archive 
} from 'lucide-react';

export default function Dashboard() {
  const { awardXP } = useAuth();

  const sheldonQuotes = [
    "Bazinga! You fell victim to another one of my classic practical jokes.",
    "Scissors cuts paper, paper covers rock, rock crushes lizard, Spock smashes scissors...",
    "I'm not crazy. My mother had me tested.",
    "A slide presentation? Excellent. Lesser minds learn better with visual aids.",
    "That is my spot. In an ever-changing world, it is the single point of consistency."
  ];

  const triggerBazinga = () => {
    const quote = sheldonQuotes[Math.floor(Math.random() * sheldonQuotes.length)];
    alert(`Dr. Logic says:\n\n"${quote}"`);
    awardXP(5); // Reward 5 XP for fun interactions
  };

  const actionCards = [
    {
      title: "Idea Evaluation Engine",
      desc: "Input your startup parameters, market specs, and engineering assumptions. Sheldon scores viability.",
      path: "/evaluator",
      icon: LineChart
    },
    {
      title: "Deep Lectures",
      desc: "Generate structured, formulaic briefings on physics, algorithms, or complex systems.",
      path: "/lecture",
      icon: GraduationCap
    },
    {
      title: "Logic Challenge Arena",
      desc: "Solve logic teasers and mathematical riddles. Level up your credentials.",
      path: "/challenges",
      icon: Puzzle
    },
    {
      title: "Debate Chamber",
      desc: "Submit a thesis or opinion. See side-by-side logical deconstruction and syntheses.",
      path: "/debate",
      icon: Scale
    }
  ];

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-8 max-w-7xl w-full mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#00f0ff]/15 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Futuristic Laboratory Dashboard</h2>
          <p className="text-sm text-[#94a3b8] mt-1">
            Welcome to the central intelligence hub. Prepare to Stress-Test ideas and explore rigorous logic.
          </p>
        </div>
        <button 
          onClick={triggerBazinga}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-[#00f0ff]/15 hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 hover:shadow-[0_0_15px_rgba(0,240,255,0.15)] rounded-lg text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5 text-white active:translate-y-0"
        >
          <Sparkles className="w-4 h-4 text-[#00f0ff]" />
          <span>Bazinga!</span>
        </button>
      </div>

      {/* Hero Card */}
      <section className="glass-card glass-card-header-glow relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 flex flex-col items-start text-left">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white">
            AI SHELDON
          </h1>
          <p className="text-lg md:text-xl font-mono text-[#00f0ff] mt-2">
            Think Before You Build.
          </p>
          <p className="text-sm md:text-base text-[#94a3b8] leading-relaxed mt-4 max-w-2xl">
            A brutally honest logical advisor, mentor, and fact explorer inspired by the ultimate analytical mind. Challenge your premises, audit your engineering architecture, and verify your facts before deploying them to reality.
          </p>
          <div className="flex flex-wrap gap-4 mt-8 w-full sm:w-auto">
            <Link 
              href="/evaluator" 
              className="flex items-center justify-center gap-2 py-3 px-6 bg-[#00f0ff] text-[#050814] hover:bg-[#00c8d6] hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] rounded-lg text-sm font-bold cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Evaluate My Idea</span>
            </Link>
            <Link 
              href="/chat" 
              className="flex items-center justify-center gap-2 py-3 px-6 bg-white/5 border border-[#00f0ff]/15 hover:border-[#00f0ff]/30 hover:bg-[#00f0ff]/5 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <MessagesSquare className="w-4 h-4 text-[#00f0ff]" />
              <span>Stress-Test Chat</span>
            </Link>
            <Link 
              href="/lecture" 
              className="flex items-center justify-center gap-2 py-3 px-6 bg-white/5 border border-[#00f0ff]/15 hover:border-[#00f0ff]/30 hover:bg-[#00f0ff]/5 rounded-lg text-sm font-semibold cursor-pointer transition-all hover:-translate-y-0.5"
            >
              <GraduationCap className="w-4 h-4 text-[#00f0ff]" />
              <span>Listen to Lectures</span>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="p-4 rounded-full bg-[#00f0ff]/5 border border-[#00f0ff]/10">
            <Avatar size={220} />
          </div>
          <div className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest px-3 py-1 bg-[#00f0ff]/5 border border-[#00f0ff]/15 rounded-full">
            Logic Core Online
          </div>
        </div>
      </section>

      {/* Laboratory Systems Section */}
      <section className="flex flex-col gap-4">
        <h3 className="font-mono text-sm font-bold text-[#00f0ff] uppercase tracking-widest">
          Laboratory Systems
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {actionCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Link 
                key={idx}
                href={card.path} 
                className="glass-card p-6 flex flex-col gap-4 hover:-translate-y-1 hover:border-[#00f0ff]/25 no-underline"
              >
                <div className="p-3 bg-[#00f0ff]/5 border border-[#00f0ff]/15 rounded-xl w-fit">
                  <Icon className="w-6 h-6 text-[#00f0ff]" />
                </div>
                <div className="flex flex-col gap-2">
                  <h4 className="text-base font-bold text-white">{card.title}</h4>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{card.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
