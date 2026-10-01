'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { 
  Atom, 
  LayoutDashboard, 
  MessagesSquare, 
  BrainCircuit, 
  GraduationCap, 
  Scale, 
  Lightbulb, 
  Puzzle, 
  Archive, 
  Menu, 
  Flame, 
  Trophy, 
  LogOut, 
  LogIn,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Chat with Dr. Logic', path: '/chat', icon: MessagesSquare },
    { name: 'Idea Evaluator', path: '/evaluator', icon: BrainCircuit },
    { name: 'Lecture & Podcast', path: '/lecture', icon: GraduationCap },
    { name: 'Debate Chamber', path: '/debate', icon: Scale },
    { name: 'Fact Generator', path: '/facts', icon: Lightbulb },
    { name: 'Puzzle Arena', path: '/challenges', icon: Puzzle },
    { name: 'Knowledge Vault', path: '/vault', icon: Archive },
    { name: 'API Settings', path: '/settings', icon: Settings },
  ];

  // Helper for initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // XP level progress helper
  const getXpProgress = () => {
    if (!user) return { percent: 20, max: 100 };
    const xp = user.xp;
    let min = 0;
    let max = 100;
    
    if (user.level === 'Thinker') { min = 100; max = 250; }
    else if (user.level === 'Analyst') { min = 250; max = 500; }
    else if (user.level === 'Scientist') { min = 500; max = 800; }
    else if (user.level === 'Genius') { min = 800; max = 1500; }
    else if (user.level === 'Nobel Candidate') { min = 1500; max = 3000; }

    const percent = Math.min(100, Math.max(5, ((xp - min) / (max - min)) * 100));
    return { percent, max };
  };

  const xpProgress = getXpProgress();

  return (
    <>
      <aside className="w-full md:w-[280px] bg-[#050814]/85 border-b md:border-b-0 md:border-r border-[#00f0ff]/15 backdrop-blur-[20px] flex flex-col h-auto md:h-screen sticky top-0 z-[100] transition-all">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[#00f0ff]/15 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <Atom className="w-8 h-8 text-[#00f0ff] filter drop-shadow-[0_0_8px_rgba(0,240,255,0.3)] animate-spin-slow" style={{ animationDuration: '12s' }} />
            <div className="flex flex-col">
              <h1 className="text-[1.2rem] font-extrabold leading-none bg-gradient-to-r from-white to-[#00f0ff] bg-clip-text text-transparent">
                AI SHELDON
              </h1>
              <span className="text-[0.65rem] text-[#64748b] font-mono tracking-widest uppercase mt-1">
                Think Before You Build
              </span>
            </div>
          </Link>
          <button 
            className="block md:hidden text-white cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className={`flex-1 px-3 py-5 flex-col gap-1.5 overflow-y-auto ${mobileOpen ? 'flex' : 'hidden md:flex'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 text-[0.95rem] font-medium rounded-lg border border-transparent transition-all hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/10 hover:translate-x-1 ${
                  isActive 
                    ? 'text-[#00f0ff] bg-[#00f0ff]/8 border-[#00f0ff]/25 shadow-[inset_0_0_12px_rgba(0,240,255,0.05)]' 
                    : 'text-[#94a3b8]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Stats/Profile Section */}
        <div className="hidden md:block p-5 border-t border-[#00f0ff]/15 bg-[#050814]/50">
          {user ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#bd00ff] flex items-center justify-center font-bold text-[#050814] border border-[#00f0ff]/15">
                  {getInitials(user.name)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-[0.9rem] text-white truncate max-w-[150px]">{user.name}</span>
                  <span className="text-[0.75rem] text-[#00f0ff] font-mono font-bold uppercase tracking-wider">
                    {user.level}
                  </span>
                </div>
              </div>
              
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-gradient-to-r from-[#00f0ff] to-[#bd00ff] rounded-full transition-all duration-500" 
                  style={{ width: `${xpProgress.percent}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-[0.7rem] text-[#64748b] font-mono">
                <span>{user.xp} / {xpProgress.max} XP</span>
                <span>LVL</span>
              </div>

              <div className="flex gap-3 mt-1.5">
                <div className="flex items-center justify-center gap-1.5 text-[0.75rem] py-1 px-2 bg-white/5 rounded border border-[#00f0ff]/15 text-[#ff9d00] border-[#ff9d00]/20 flex-1">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{user.streak} Day{user.streak > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[0.75rem] py-1 px-2 bg-white/5 rounded border border-[#00f0ff]/15 text-[#94a3b8] flex-1">
                  <Trophy className="w-3.5 h-3.5 text-[#ffdd00]" />
                  <span>{user.score} Pts</span>
                </div>
              </div>

              <button 
                onClick={logout}
                className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-[0.8rem] font-semibold cursor-pointer hover:bg-red-500/25 hover:border-red-500/40 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <span className="text-[0.8rem] text-[#94a3b8] text-center">Sign in to save evaluations, track level progress and daily streaks.</span>
              <Link 
                href="/login"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#00f0ff] text-[#050814] rounded-lg text-[0.85rem] font-bold cursor-pointer hover:bg-[#00c8d6] transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Initialize Account</span>
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
