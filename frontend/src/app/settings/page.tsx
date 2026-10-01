'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Key, HelpCircle, Save, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'simulated' | 'live' | 'checking'>('checking');
  const [message, setMessage] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Check current API status
  const checkStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/health`);
      const data = await res.json();
      
      // Let's check status via health or other endpoint
      // For simplicity, we can fetch health
      if (res.ok) {
        // Let's do a mock test or assume live if there is a config
        // Actually, we can check the status from backend settings endpoint
        const keyCheckRes = await fetch(`${API_URL}/sheldon/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: [], message: 'test_api_key_status' })
        });
        
        const keyCheckData = await keyCheckRes.json();
        // Our fallback simulator returns specific strings, so we can know if it's simulated or live!
        if (keyCheckData.reply.includes("incomplete understanding") || keyCheckData.reply.includes("Salutations")) {
          setStatus('simulated');
        } else {
          setStatus('live');
        }
      }
    } catch (e) {
      console.error("Check status error:", e);
      setStatus('simulated');
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/sheldon/settings/key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("API Key successfully synced and loaded in server memory.");
        // Clear field for safety
        setApiKey('');
        checkStatus();
      } else {
        setMessage(data.error || "Failed to save configuration.");
      }
    } catch (err) {
      setMessage("Failed to connect to backend configuration endpoint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-4xl w-full mx-auto justify-center">
      {/* Header */}
      <div className="border-b border-[#00f0ff]/15 pb-4">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-[#00f0ff]" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Console Configuration Settings</h2>
            <p className="text-xs text-[#94a3b8]">Configure API keys and monitor backend engine status.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
        
        {/* Settings Form */}
        <div className="glass-card p-6 flex flex-col gap-5 relative">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>
          
          <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <Key className="w-4 h-4 text-[#00f0ff]" />
            <span>OpenAI API Integration</span>
          </h3>

          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[0.7rem] font-mono font-bold text-[#94a3b8] uppercase tracking-wider">
                OpenAI API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg text-sm text-white placeholder-[#64748b] focus:border-[#00f0ff] outline-none transition-all"
                placeholder="sk-proj-..."
                required
                disabled={loading}
              />
              <span className="text-[0.65rem] text-[#64748b] leading-relaxed">
                Your key will be securely saved into the server's local `.env` file and loaded dynamically.
              </span>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-xs leading-relaxed border ${
                message.includes("success") || message.includes("loaded")
                  ? 'bg-green-500/5 border-green-500/20 text-green-400'
                  : 'bg-red-500/5 border-red-500/20 text-red-400'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="flex items-center justify-center gap-2 py-2.5 px-6 bg-[#00f0ff] text-[#050814] hover:bg-[#00c8d6] hover:shadow-[0_0_12px_rgba(0,240,255,0.2)] rounded-lg text-sm font-bold cursor-pointer transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Apply Configuration</span>
            </button>
          </form>
        </div>

        {/* Status Panel */}
        <div className="glass-card p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Engine Diagnostics
          </h3>

          <div className="flex flex-col gap-3">
            {/* Status Item */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/2 border border-[#00f0ff]/15">
              <span className="text-xs text-[#94a3b8]">AI Engine Mode:</span>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                {status === 'checking' ? (
                  <span className="text-yellow-400 animate-pulse">Diagnosing...</span>
                ) : status === 'live' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">Live AI Enabled</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-500">Offline Mock Mode</span>
                  </>
                )}
              </div>
            </div>

            {/* Help Callout */}
            <div className="p-3 bg-[#00f0ff]/5 border border-[#00f0ff]/10 rounded-lg flex gap-2.5">
              <HelpCircle className="w-4 h-4 text-[#00f0ff] flex-shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 text-[0.65rem] text-[#94a3b8] leading-relaxed">
                <span className="font-bold text-white">Why is this required?</span>
                <span>To prevent simulated responses (hallucinations), the AI Sheldon core needs an API key to communicate with OpenAI. Adding your key unlocks dynamic, context-aware evaluations, lecture transcripts, and debates.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
