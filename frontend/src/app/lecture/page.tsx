'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  Bookmark, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  BookOpen, 
  FileText 
} from 'lucide-react';

interface LectureData {
  title: string;
  topic: string;
  level: string;
  duration: number;
  content: string;
  audioText: string;
}

export default function Lecture() {
  const { token, updateUserStatsState } = useAuth();
  
  const [topic, setTopic] = useState('quantum');
  const [level, setLevel] = useState('expert');
  const [duration, setDuration] = useState('30');
  
  const [loading, setLoading] = useState(false);
  const [lecture, setLecture] = useState<LectureData | null>(null);
  const [saved, setSaved] = useState(false);
  
  // Podcast controls
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('1.5');
  const [voiceModel, setVoiceModel] = useState('sheldon');
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchLecture = async () => {
    setLoading(true);
    setSaved(false);
    
    // Stop speaking if active
    stopAudio();

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/sheldon/lecture`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ topic, level, duration })
      });

      const data = await res.json();
      if (res.ok) {
        setLecture(data.lecture);
        // Clear notes for new lecture
        setNotes('');
        
        // Update user stats
        if (data.userStats) {
          updateUserStatsState(data.userStats);
        }
      } else {
        alert(data.error || "Failed to generate lecture.");
      }
    } catch (err) {
      alert("Failed to communicate with Sheldon core. Please verify your server.");
    } finally {
      setLoading(false);
    }
  };

  // Generate initial default lecture on load
  useEffect(() => {
    fetchLecture();
    return () => {
      stopAudio();
    };
  }, [topic, level, duration]);

  const saveLecture = async () => {
    if (!lecture || !token) {
      alert("Please authenticate to save outline structures.");
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
          title: lecture.title,
          content: lecture.content + (notes ? `<h3>Student Notes</h3><p>${notes}</p>` : ''),
          type: 'lecture',
          previewText: `${lecture.level} Level | ${lecture.duration} Mins`,
          tags: `${lecture.topic}, Lecture`
        })
      });

      if (res.ok) {
        setSaved(true);
        alert("Lecture structure synced to Knowledge Vault.");
      }
    } catch (err) {
      alert("Network failure saving to database.");
    }
  };

  // --- AUDIO SYNTHESIS CONTROLS ---
  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setProgress(0);
  };

  const updateSpeechRateAndPitch = () => {
    if (!utteranceRef.current) return;
    utteranceRef.current.rate = parseFloat(speed);
    
    if (voiceModel === 'sheldon') {
      utteranceRef.current.pitch = 1.25; // Sheldon pitch
    } else if (voiceModel === 'professor') {
      utteranceRef.current.pitch = 0.8; // Deep voice
    } else {
      utteranceRef.current.pitch = 1.0;
    }
  };

  const toggleAudio = () => {
    if (!lecture) return;

    if (!window.speechSynthesis) {
      alert("Speech Synthesis is not supported in this browser.");
      return;
    }

    if (playing) {
      // Pause/Stop
      window.speechSynthesis.cancel();
      setPlaying(false);
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    } else {
      // Start Play
      setPlaying(true);
      
      const utter = new SpeechSynthesisUtterance(lecture.audioText);
      utteranceRef.current = utter;
      
      // Select voice
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = voices.find(v => v.lang.includes('en-US') && v.name.includes('Google'));
      if (!selectedVoice) selectedVoice = voices.find(v => v.lang.includes('en'));
      if (selectedVoice) utter.voice = selectedVoice;

      updateSpeechRateAndPitch();

      utter.onend = () => {
        setPlaying(false);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        setProgress(100);
      };
      
      utter.onerror = () => {
        setPlaying(false);
        if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      };

      window.speechSynthesis.speak(utter);

      // Animate progress bar based on estimated read duration
      let currentProgress = progress;
      const durationSecs = 20; // Estimated simulation length
      progressTimerRef.current = setInterval(() => {
        currentProgress += 1.5 * parseFloat(speed);
        const percent = Math.min(100, (currentProgress / durationSecs) * 100);
        setProgress(percent);
        if (percent >= 100) {
          if (progressTimerRef.current) clearInterval(progressTimerRef.current);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    updateSpeechRateAndPitch();
  }, [speed, voiceModel]);

  const seekProgress = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = (clickX / rect.width) * 100;
    setProgress(percent);
  };

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Settings Header bar */}
      <div className="card bg-[#0b112c]/65 border border-[#00f0ff]/15 rounded-xl p-4 flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] font-mono text-[#94a3b8]">Topic:</span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-[#050814]/80 border border-[#00f0ff]/15 text-xs text-white rounded px-2.5 py-1.5 focus:border-[#00f0ff] outline-none"
            >
              <option value="quantum">Quantum Superposition & Computing</option>
              <option value="complexity">Big O Complexity & Turing Halting</option>
              <option value="blackhole">Black Hole Singularity Mechanics</option>
              <option value="psych">Behavioral Psychology & Cognitive Bias</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] font-mono text-[#94a3b8]">Rigor:</span>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-[#050814]/80 border border-[#00f0ff]/15 text-xs text-white rounded px-2.5 py-1.5 focus:border-[#00f0ff] outline-none"
            >
              <option value="beginner">Beginner (Analogy)</option>
              <option value="intermediate">Intermediate (Formulaic)</option>
              <option value="expert">Expert (Rigorous)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] font-mono text-[#94a3b8]">Time:</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="bg-[#050814]/80 border border-[#00f0ff]/15 text-xs text-white rounded px-2.5 py-1.5 focus:border-[#00f0ff] outline-none"
            >
              <option value="15">15 Minutes</option>
              <option value="30">30 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          {token && (
            <button
              onClick={saveLecture}
              disabled={saved || !lecture}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-[#00f0ff]/15 hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 rounded-lg text-xs font-semibold cursor-pointer text-white transition-all disabled:opacity-50"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>{saved ? "Outline Saved" : "Save Outline"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
        
        {/* Left: Lecture Content */}
        <div className="glass-card p-6 flex flex-col gap-4 min-h-[480px]">
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="w-8 h-8 border-2 border-t-transparent border-[#00f0ff] rounded-full animate-spin"></div>
              <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest mt-2">
                Compiling transcript...
              </span>
            </div>
          )}

          {!loading && lecture && (
            <article className="animate-fadeIn">
              <div className="flex items-center gap-2 font-mono text-[0.75rem] text-[#00f0ff] mb-3">
                <span>{lecture.topic}</span>
                <span>•</span>
                <span>{lecture.level}</span>
                <span>•</span>
                <span>{lecture.duration} MIN LECTURE</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white leading-tight mb-6">
                {lecture.title}
              </h2>
              
              <div 
                className="lecture-body text-sm md:text-base leading-relaxed text-[#94a3b8] flex flex-col gap-4"
                dangerouslySetInnerHTML={{ __html: lecture.content }}
              />
            </article>
          )}
        </div>

        {/* Right: Podcast Player & Notes */}
        <div className="flex flex-col gap-6 sticky top-6">
          {/* Podcast Player */}
          <div className="glass-card p-5 flex flex-col items-center gap-4 text-center">
            <span className="text-[0.65rem] text-[#00f0ff] font-mono tracking-widest uppercase">
              Podcast Console
            </span>

            {/* Audio wave animation */}
            <div className="flex items-center justify-center gap-1.5 h-10 w-full">
              {Array.from({ length: 12 }).map((_, barIdx) => (
                <div 
                  key={barIdx} 
                  className="w-1 bg-[#00f0ff] rounded-full transition-all"
                  style={{
                    height: playing ? `${Math.floor(Math.random() * 28) + 6}px` : '8px',
                    transitionDuration: '0.15s',
                    animation: playing ? 'wave-bar-pulse 1.2s infinite ease-in-out' : 'none',
                    animationDelay: playing ? `${barIdx * 80}ms` : '0ms'
                  }}
                />
              ))}
            </div>

            <div className="w-full">
              <h4 className="font-bold text-white text-sm truncate max-w-[280px] mx-auto">
                {lecture?.title || "Awaiting Compile"}
              </h4>
              <p className="text-[0.7rem] text-[#64748b] font-mono mt-0.5">Presented by Dr. Logic</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full">
              <div 
                onClick={seekProgress}
                className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer overflow-hidden"
              >
                <div 
                  className="h-full bg-[#00f0ff] rounded-full transition-all" 
                  style={{ width: `${progress}%`, transitionDuration: '0.2s' }}
                />
              </div>
              <div className="flex justify-between text-[0.65rem] text-[#64748b] font-mono mt-1.5">
                <span>0:00</span>
                <span>{lecture ? `${lecture.duration}:00` : '0:00'}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-5 my-1">
              <button 
                onClick={() => setProgress(Math.max(0, progress - 10))}
                className="text-white hover:text-[#00f0ff] transition-all cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={toggleAudio}
                className="w-12 h-12 rounded-full bg-[#00f0ff] hover:bg-[#00c8d6] hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] text-[#050814] flex items-center justify-center cursor-pointer transition-all active:scale-95"
              >
                {playing ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
              <button 
                onClick={() => setProgress(Math.min(100, progress + 10))}
                className="text-white hover:text-[#00f0ff] transition-all cursor-pointer"
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            {/* Audio settings */}
            <div className="grid grid-cols-2 gap-4 w-full border-t border-[#00f0ff]/10 pt-4 mt-2">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[0.6rem] text-[#64748b] font-mono uppercase">Voice Model</span>
                <select
                  value={voiceModel}
                  onChange={(e) => setVoiceModel(e.target.value)}
                  className="bg-[#050814]/85 border border-[#00f0ff]/15 text-[0.7rem] text-white rounded px-1.5 py-1 w-full focus:border-[#00f0ff] outline-none"
                >
                  <option value="sheldon">Dr. Logic (Fast)</option>
                  <option value="professor">Professor (Deep)</option>
                  <option value="scientist">Scientist (Precise)</option>
                </select>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-[0.6rem] text-[#64748b] font-mono uppercase">Playback Speed</span>
                <select
                  value={speed}
                  onChange={(e) => setSpeed(e.target.value)}
                  className="bg-[#050814]/85 border border-[#00f0ff]/15 text-[0.7rem] text-white rounded px-1.5 py-1 w-full focus:border-[#00f0ff] outline-none"
                >
                  <option value="1">1.00x</option>
                  <option value="1.2">1.20x</option>
                  <option value="1.5">1.50x</option>
                  <option value="2">2.00x</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 font-bold text-xs text-white">
              <FileText className="w-4 h-4 text-[#00f0ff]" />
              <span>Lecture Notes</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full min-h-[120px] bg-[#050814]/50 border border-[#00f0ff]/15 rounded-lg p-2.5 text-xs text-white placeholder-[#64748b] focus:border-[#00f0ff] outline-none resize-y transition-all"
              placeholder="Record your findings, equations, or notes. They will be saved alongside the outline."
            />
          </div>
        </div>

      </div>
    </main>
  );
}
