'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../../components/Avatar';
import { Send, Sparkles, MessageCircle, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function Chat() {
  const { token, updateUserStatsState } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Greetings, human mind. I am Dr. Logic. I am programmed to assist you in making decisions, correcting scientific misinformation, and teaching concepts. I must warn you: I do not validate weak assumptions, nor do I engage in comforting platitudes. Tell me, what hypothesis are we testing today?",
      timestamp: new Date().toLocaleTimeString().split(' ')[0]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // Autoscroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Voice synthesis speaker
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    
    // Stop any ongoing voice
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice properties (fast, high-pitched sheldon style)
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google'));
    if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('en'));
    
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = 1.45; // Sheldon speaks rapidly
    utterance.pitch = 1.25; // Slightly higher pitch

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const messageText = input.trim();
    if (!messageText || loading) return;

    setInput('');
    const userMsg: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString().split(' ')[0]
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Keep only last 10 messages for context size efficiency
      const history = messages.slice(-10).map(m => ({
        role: m.role === 'user' ? 'user' as const : 'assistant' as const,
        content: m.content
      }));

      const res = await fetch(`${API_URL}/sheldon/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ history, message: messageText })
      });

      const data = await res.json();
      
      if (res.ok) {
        const sheldonMsg: Message = {
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString().split(' ')[0]
        };
        setMessages(prev => [...prev, sheldonMsg]);
        speakText(data.reply);

        // Update live user stats/XP
        if (data.userStats) {
          updateUserStatsState(data.userStats);
        }
      } else {
        const errorMsg: Message = {
          role: 'assistant',
          content: data.error || "A transaction error disrupted my server logic subroutines.",
          timestamp: new Date().toLocaleTimeString().split(' ')[0]
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
      const errorMsg: Message = {
        role: 'assistant',
        content: "Failed to connect to Sheldon's server core. Please confirm the server port is listening.",
        timestamp: new Date().toLocaleTimeString().split(' ')[0]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setMessages([
      {
        role: 'assistant',
        content: "Console reset complete. State your new parameters.",
        timestamp: new Date().toLocaleTimeString().split(' ')[0]
      }
    ]);
  };

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-5xl w-full mx-auto h-[calc(100vh-80px)] md:h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#00f0ff]/15 pb-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-[#00f0ff]" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Interactive Mentor Chat</h2>
            <p className="text-xs text-[#94a3b8]">Stress-Test logic models with Dr. Logic.</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:border-red-500/30 hover:bg-red-500/10 text-xs rounded-lg cursor-pointer text-[#94a3b8] hover:text-red-400 transition-all"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Main chat box */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden p-4 min-h-0 relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent"></div>

        {/* Scrollable messages panel */}
        <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-5 py-2">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={index}
                className={`flex gap-3.5 max-w-[85%] animate-fadeIn ${
                  isUser ? 'self-end flex-row-reverse' : 'self-start'
                }`}
              >
                {/* Avatar Icon */}
                <div 
                  className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${
                    isUser 
                      ? 'bg-gradient-to-br from-[#bd00ff] to-[#7000ff] text-white' 
                      : 'bg-gradient-to-br from-[#00f0ff] to-[#0099ff] text-[#050814] shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  }`}
                >
                  {isUser ? 'U' : 'S'}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col">
                  <div 
                    className={`px-4 py-3 rounded-2xl border text-sm leading-relaxed ${
                      isUser 
                        ? 'bg-[#bd00ff]/8 border-[#bd00ff]/20 text-[#f8fafc] rounded-tr-none' 
                        : 'bg-[#00f0ff]/6 border-[#00f0ff]/20 text-[#f8fafc] rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className={`text-[0.7rem] text-[#64748b] font-mono mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                    {isUser ? 'You' : 'Dr. Logic'} • {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-3.5 max-w-[80%] self-start animate-fadeIn">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#0099ff] text-[#050814] flex items-center justify-center font-bold text-sm shadow-[0_0_8px_rgba(0,240,255,0.3)]">
                S
              </div>
              <div className="flex flex-col gap-1">
                <div className="px-4 py-3 bg-[#00f0ff]/6 border border-[#00f0ff]/20 rounded-2xl rounded-tl-none flex items-center gap-1.5 min-w-[70px]">
                  <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <form onSubmit={handleSend} className="flex gap-3 mt-4 border-t border-[#00f0ff]/10 pt-4 flex-shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-xl px-4 py-3 text-sm text-white placeholder-[#64748b] focus:border-[#00f0ff] focus:shadow-[0_0_12px_rgba(0,240,255,0.15)] outline-none transition-all disabled:opacity-50"
            placeholder="Type your hypothesis or technical concept here..."
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex items-center justify-center w-12 h-12 bg-[#00f0ff] hover:bg-[#00c8d6] disabled:bg-[#00f0ff]/20 disabled:text-[#00f0ff]/50 disabled:cursor-not-allowed text-[#050814] rounded-xl cursor-pointer hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Mini speaking indicator widget */}
      {speaking && (
        <div className="fixed bottom-6 right-6 p-3 bg-[#00f0ff]/10 border border-[#00f0ff] rounded-full shadow-[0_0_15px_rgba(0,240,255,0.2)] animate-pulse flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-[#00f0ff]" />
        </div>
      )}
    </main>
  );
}
