'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Atom, LogIn, UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!email || !password || (isRegister && !name)) {
      setError("Please fill out all required parameters.");
      setSubmitting(false);
      return;
    }

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister ? { email, password, name } : { email, password };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login
        login(data.user.email, data.token, data.user);
        router.push('/');
      } else {
        setError(data.error || "An authentication error occurred.");
      }
    } catch (err) {
      console.error("Auth submit error:", err);
      setError("Failed to communicate with authentication servers.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSubmitting(true);
    
    // Simulate a successful Google authentication
    try {
      const simulatedGooglePayload = {
        email: email || 'curious.genius@gmail.com',
        googleId: 'google-oauth2-11235813',
        name: name || 'Genius Mind'
      };

      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulatedGooglePayload)
      });

      const data = await res.json();
      if (res.ok) {
        login(data.user.email, data.token, data.user);
        router.push('/');
      } else {
        setError(data.error || "Google login simulation failed.");
      }
    } catch (err) {
      setError("Failed to sync Google SSO with backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center p-6 md:p-8">
      <div className="w-full max-w-md glass-card p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent"></div>

        {/* Branding header */}
        <div className="flex flex-col items-center gap-2 text-center">
          <Atom className="w-10 h-10 text-[#00f0ff] animate-spin-slow" style={{ animationDuration: '10s' }} />
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-1">
            Initialize Sheldon Account
          </h2>
          <p className="text-xs text-[#94a3b8]">
            {isRegister 
              ? "Establish your credentials to join the laboratory research matrix." 
              : "Verify your credentials to boot up your profile database."}
          </p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isRegister && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg text-sm text-white placeholder-[#64748b] focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] outline-none transition-all"
                  placeholder="Richard Feynman"
                  required
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg text-sm text-white placeholder-[#64748b] focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] outline-none transition-all"
                placeholder="feynman@caltech.edu"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[0.7rem] font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
              Password Cryptography
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg text-sm text-white placeholder-[#64748b] focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#00f0ff] hover:bg-[#00c8d6] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] text-[#050814] font-bold rounded-lg text-sm transition-all cursor-pointer mt-2 disabled:opacity-50"
          >
            {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
            <span>{isRegister ? "Register Research ID" : "Unlock Core Console"}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="h-[1px] bg-[#00f0ff]/10 flex-1"></div>
          <span className="text-[0.65rem] text-[#64748b] font-mono tracking-widest uppercase">
            OR
          </span>
          <div className="h-[1px] bg-[#00f0ff]/10 flex-1"></div>
        </div>

        {/* Google SSO trigger */}
        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full py-2.5 bg-white/5 border border-[#00f0ff]/15 hover:border-[#00f0ff]/30 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer hover:bg-white/10"
        >
          <span>Use Simulated Google Login</span>
        </button>

        {/* Mode Switcher */}
        <div className="text-center text-xs text-[#94a3b8] mt-2">
          {isRegister ? (
            <span>
              Already possess credentials?{" "}
              <button 
                onClick={() => setIsRegister(false)}
                className="text-[#00f0ff] hover:underline font-semibold cursor-pointer"
              >
                Access Core
              </button>
            </span>
          ) : (
            <span>
              Need credentials?{" "}
              <button 
                onClick={() => setIsRegister(true)}
                className="text-[#00f0ff] hover:underline font-semibold cursor-pointer"
              >
                Request Authorization
              </button>
            </span>
          )}
        </div>
      </div>
    </main>
  );
}
