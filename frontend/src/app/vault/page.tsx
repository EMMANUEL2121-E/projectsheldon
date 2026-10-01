'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Archive, Search, Trash2, LogIn, ArchiveX } from 'lucide-react';

interface VaultItem {
  id: string;
  title: string;
  content: string;
  type: string;
  previewText: string;
  tags: string;
  date: string;
}

export default function Vault() {
  const { token } = useAuth();
  
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const fetchVault = async () => {
    if (!token) return;
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/vault`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setItems(data);
      }
    } catch (err) {
      console.error("Fetch vault error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVault();
  }, [token]);

  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to purge this record from your vault?")) return;

    try {
      const res = await fetch(`${API_URL}/vault/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      } else {
        alert("Failed to delete vault entry.");
      }
    } catch (err) {
      alert("Network error purging record.");
    }
  };

  const clearAll = async () => {
    if (!confirm("Purge all records in the Knowledge Vault? This operation is irreversible.")) return;

    // Delete one by one for local SQLite ease, or batch clear
    try {
      for (const item of items) {
        await fetch(`${API_URL}/vault/${item.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      setItems([]);
    } catch (err) {
      alert("Error occurred during batch purge.");
    }
  };

  // Live filter
  const filteredItems = items.filter(item => {
    const q = search.toLowerCase();
    return item.title.toLowerCase().includes(q) ||
           item.content.toLowerCase().includes(q) ||
           item.tags.toLowerCase().includes(q);
  });

  return (
    <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto">
      {/* Header */}
      <div className="border-b border-[#00f0ff]/15 pb-4">
        <div className="flex items-center gap-3">
          <Archive className="w-6 h-6 text-[#00f0ff]" />
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Personal Knowledge Vault</h2>
            <p className="text-xs text-[#94a3b8]">Review and search your saved evaluations, lectures, and scientific facts.</p>
          </div>
        </div>
      </div>

      {!token ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-[#00f0ff]/15 rounded-xl bg-white/2 max-w-md mx-auto my-12 gap-5">
          <ArchiveX className="w-12 h-12 text-[#00f0ff]/20 animate-pulse" />
          <div>
            <h3 className="text-white font-bold mb-1">Knowledge Vault Locked</h3>
            <p className="text-xs text-[#94a3b8] leading-relaxed">
              Create an account or login to access database vault storage, preserve your evaluations, and review lecture transcripts.
            </p>
          </div>
          <a
            href="/login"
            className="flex items-center justify-center gap-2 py-2.5 px-6 bg-[#00f0ff] hover:bg-[#00c8d6] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] text-[#050814] font-bold rounded-lg text-sm transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Initialize Account</span>
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Controls Bar */}
          <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#050814]/80 border border-[#00f0ff]/15 rounded-lg text-xs text-white placeholder-[#64748b] focus:border-[#00f0ff] outline-none transition-all"
                placeholder="Search vault items by title, contents, or tags..."
              />
            </div>
            {items.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500 rounded-lg text-xs font-semibold cursor-pointer transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Vault</span>
              </button>
            )}
          </div>

          {/* Grid list */}
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="w-8 h-8 border-2 border-t-transparent border-[#00f0ff] rounded-full animate-spin"></div>
              <span className="font-mono text-xs text-[#00f0ff] uppercase tracking-widest mt-2">
                Retrieving vault files...
              </span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-16 text-[#64748b]">
              <ArchiveX className="w-12 h-12 mb-4 text-[#00f0ff]/10" />
              <h4 className="text-[#94a3b8] font-semibold mb-1">No Records Found</h4>
              <p className="text-xs max-w-xs leading-relaxed">
                Save facts, outlines, or ideas while using the laboratory tools to see them cataloged here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {filteredItems.map((item) => {
                const tagsList = item.tags.split(',').map(t => t.trim());
                return (
                  <div key={item.id} className="glass-card p-5 flex flex-col gap-4 relative overflow-hidden h-full">
                    {/* Top strip coloring depending on type */}
                    <div className={`absolute top-0 left-0 w-full h-[2px] ${
                      item.type === 'fact' 
                        ? 'bg-[#00f0ff]' 
                        : item.type === 'lecture'
                        ? 'bg-[#bd00ff]'
                        : 'bg-green-400'
                    }`}></div>

                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-0.5 text-[0.65rem] font-mono font-bold rounded uppercase ${
                        item.type === 'fact'
                          ? 'bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/15'
                          : item.type === 'lecture'
                          ? 'bg-[#bd00ff]/10 text-[#bd00ff] border border-[#bd00ff]/15'
                          : 'bg-green-500/10 text-green-400 border border-green-500/15'
                      }`}>
                        {item.type}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-[#64748b] hover:text-red-400 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <h4 className="font-bold text-white text-sm md:text-base leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#94a3b8] leading-relaxed line-clamp-4">
                        {item.previewText}
                      </p>
                    </div>

                    <div className="flex justify-between items-center border-t border-[#00f0ff]/10 pt-3.5 text-[0.7rem] text-[#64748b] font-mono mt-2">
                      <span>{item.date}</span>
                      <div className="flex gap-1.5">
                        {tagsList.map((tag, tIdx) => (
                          <span key={tIdx} className="bg-white/5 px-2 py-0.5 rounded text-[0.65rem] text-[#94a3b8]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
