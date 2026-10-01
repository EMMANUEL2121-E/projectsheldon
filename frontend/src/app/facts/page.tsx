'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lightbulb, Sparkles, Heart, BookOpen, Star } from 'lucide-react';

interface FactItem {
  text: string;
  expl: string;
  src: string;
  imp: string;
}

const FACTS: Record<string, FactItem[]> = {
  space: [
    { text: "Venus is the only planet that rotates clockwise.", expl: "Retrograde rotation means the Sun rises in the west. This is believed to have been caused by a planetary impact.", src: "NASA Space Science Division", imp: "Confirms chaotic solar system formation." },
    { text: "Neutron stars are so dense that a single teaspoon weighs 6 billion tons.", expl: "A neutron star's gravity is 2 billion times stronger than Earth's due to protons and electrons collapsing into neutrons.", src: "Chandra X-Ray Observatory", imp: "Helps study matter under extreme pressure." },
    { text: "Space is not a perfect vacuum; it contains 1 atom per cubic centimeter.", expl: "This interstellar medium is incredibly thin, yet it impacts high-velocity spacecraft over long distances.", src: "ESA Research", imp: "Crucial for calculating drag on deep-space probes." }
  ],
  physics: [
    { text: "Light travels 30% slower when passing through water.", expl: "Photons interact with the electromagnetic fields of atoms, causing a delay in propagation, though their speed remains 'c' between collisions.", src: "MIT Electrodynamics", imp: "Explains refraction and allows optical lens designs." },
    { text: "Time passes faster at the top of a mountain than at sea level.", expl: "According to general relativity, gravity warps spacetime. The weaker the gravity, the faster time passes.", src: "NIST Atomic Clock Experiment", imp: "Must be accounted for in GPS satellite sync calculations." }
  ],
  math: [
    { text: "The Fibonacci sequence appears in sunflower seeds and pinecones.", expl: "This golden ratio alignment allows the maximum number of seeds to pack into a circular area without wasting space.", src: "Royal Mathematical Society", imp: "Demonstrates mathematical optimization in evolutionary biology." },
    { text: "Prime numbers act as the atoms of arithmetic.", expl: "Every integer greater than 1 is either a prime or can be represented as a unique product of primes.", src: "Euclid's Elements", imp: "The mathematical backbone of modern RSA encryption." }
  ],
  tech: [
    { text: "Quantum bits (qubits) can exist in superpositions of 1 and 0 simultaneously.", expl: "This allows quantum computers to process multiple possibilities at exponential speeds compared to classical silicon chips.", src: "IBM Quantum Division", imp: "Will break traditional encryption within decades." }
  ],
  biology: [
    { text: "Mitochondria were once independent single-celled organisms.", expl: "They merged with other cells in a symbiotic event called endosymbiosis, retaining their own separate mitochondrial DNA.", src: "Journal of Evolutionary Biology", imp: "Explains how complex eukaryotic life evolved on Earth." }
  ],
  history: [
    { text: "The calendar year 1752 was missing 11 entire days.", expl: "Britain and its colonies adopted the Gregorian calendar, jumping from Sept 2 directly to Sept 14 to correct alignment errors.", src: "Royal Observatory", imp: "Shows the integration of astronomical accuracy into civil systems." }
  ],
  psych: [
    { text: "The Dunning-Kruger effect is a cognitive bias of illusory superiority.", expl: "People with low ability at a task overestimate their competence, lacking the metadata skills to recognize their own errors.", src: "Cornell Research Journal", imp: "Alerts engineers to avoid hubris when designing critical components." }
  ]
};

export default function Facts() {
  const { token } = useAuth();
  const [category, setCategory] = useState('space');
  const [fact, setFact] = useState<FactItem | null>(null);
  const [saved, setSaved] = useState(false);

  const categories = [
    { key: 'space', name: 'Space' },
    { key: 'physics', name: 'Physics' },
    { key: 'math', name: 'Mathematics' },
    { key: 'tech', name: 'Technology' },
    { key: 'biology', name: 'Biology' },
    { key: 'history', name: 'History' },
    { key: 'psych', name: 'Psychology' }
  ];

  const generateFact = () => {
    const list = FACTS[category] || FACTS.space;
    const item = list[Math.floor(Math.random() * list.length)];
    setFact(item);
    setSaved(false);
  };

  useEffect(() => {
    generateFact();
  }, [category]);

  const saveFact = async () => {
    if (!fact || !token) {
      alert("You must be signed in to save facts to the vault.");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

    try {
      const res = await fetch(`${API_URL}/vault`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Fact: ${fact.text.slice(0, 30)}...`,
          content: fact.expl,
          type: 'fact',
          previewText: fact.text,
          tags: `${category}, Fact`
        })
      });

      if (res.ok) {
        setSaved(true);
        alert("Fact pinned to Knowledge Vault.");
      }
    } catch (err) {
      alert("Network failure saving to vault.");
    }
  };

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-4xl w-full mx-auto justify-center">
      {/* Header */}
      <div className="border-b border-[#00f0ff]/15 pb-4">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-6 h-6 text-[#00f0ff]" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Scientific Fact Generator</h2>
            <p className="text-xs text-[#94a3b8]">Explore empirical findings that shape logical frameworks.</p>
          </div>
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-4 py-2 border rounded-lg text-xs font-mono tracking-wider cursor-pointer transition-all ${
              category === cat.key
                ? 'bg-[#00f0ff]/10 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.1)]'
                : 'bg-white/3 border-[#00f0ff]/15 text-[#94a3b8] hover:bg-[#00f0ff]/5 hover:border-[#00f0ff]/30'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Fact Card */}
      {fact && (
        <div className="glass-card p-6 md:p-8 relative flex flex-col items-center text-center gap-6 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>
          
          <span className="font-mono text-[0.7rem] bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] px-4 py-1.5 rounded-full uppercase tracking-widest">
            {category} sciences
          </span>

          <p className="text-lg md:text-2xl font-semibold leading-relaxed text-white max-w-2xl">
            "{fact.text}"
          </p>

          <p className="text-xs md:text-sm text-[#94a3b8] leading-relaxed max-w-xl">
            {fact.expl}
          </p>

          {/* Metadata */}
          <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-center border-t border-[#00f0ff]/10 pt-5 text-[0.75rem] text-[#64748b] font-mono mt-3">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#00f0ff]" />
              <span>Source: <strong className="text-[#94a3b8]">{fact.src}</strong></span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>
              Why it matters: <span className="text-[#94a3b8]">{fact.imp}</span>
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-4">
            <button
              onClick={generateFact}
              className="flex items-center justify-center gap-2 py-2.5 px-6 bg-[#00f0ff] text-[#050814] hover:bg-[#00c8d6] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] rounded-lg text-sm font-bold cursor-pointer transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>Surprise Me</span>
            </button>
            {token && (
              <button
                onClick={saveFact}
                disabled={saved}
                className="flex items-center justify-center gap-2 py-2.5 px-6 bg-white/5 border border-[#00f0ff]/15 hover:border-[#00f0ff]/30 hover:bg-[#00f0ff]/5 rounded-lg text-sm font-semibold cursor-pointer text-white transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {saved ? <Star className="w-4 h-4 text-yellow-400 fill-current" /> : <Heart className="w-4 h-4 text-[#00f0ff]" />}
                <span>{saved ? "Pinned" : "Save Favorite"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
