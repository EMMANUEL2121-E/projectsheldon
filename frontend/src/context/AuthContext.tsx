'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserStats {
  id: string;
  email: string;
  name: string;
  xp: number;
  level: string;
  score: number;
  streak: number;
}

interface AuthContextType {
  user: UserStats | null;
  token: string | null;
  loading: boolean;
  login: (email: string, token: string, user: UserStats) => void;
  logout: () => void;
  refreshStats: () => Promise<void>;
  awardXP: (amount: number) => Promise<void>;
  updateUserStatsState: (stats: Partial<UserStats>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserStats | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load token and user from localStorage on init
  useEffect(() => {
    const savedToken = localStorage.getItem('sheldon_token');
    const savedUser = localStorage.getItem('sheldon_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Error parsing saved auth data:", e);
      }
    }
    setLoading(false);
  }, []);

  const login = (newEmail: string, newToken: string, userData: UserStats) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('sheldon_token', newToken);
    localStorage.setItem('sheldon_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sheldon_token');
    localStorage.removeItem('sheldon_user');
  };

  const refreshStats = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('sheldon_user', JSON.stringify(data));
      } else if (res.status === 401 || res.status === 403) {
        logout(); // Session expired
      }
    } catch (err) {
      console.error("Refresh stats error:", err);
    }
  };

  const awardXP = async (amount: number) => {
    if (!token) {
      // Award simulated local XP if offline/not logged in
      if (user) {
        const nextXp = user.xp + amount;
        let nextLvl = user.level;
        if (nextXp >= 1500) nextLvl = 'Nobel Candidate';
        else if (nextXp >= 800) nextLvl = 'Genius';
        else if (nextXp >= 500) nextLvl = 'Scientist';
        else if (nextXp >= 250) nextLvl = 'Analyst';
        else if (nextXp >= 100) nextLvl = 'Thinker';

        const updatedLocalUser = {
          ...user,
          xp: nextXp,
          score: user.score + Math.floor(amount / 2),
          level: nextLvl
        };
        setUser(updatedLocalUser);
        localStorage.setItem('sheldon_user', JSON.stringify(updatedLocalUser));
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/auth/update-xp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      if (res.ok) {
        const stats = await res.json();
        if (user) {
          const updatedUser = {
            ...user,
            xp: stats.xp,
            level: stats.level,
            score: stats.score,
            streak: stats.streak
          };
          setUser(updatedUser);
          localStorage.setItem('sheldon_user', JSON.stringify(updatedUser));
        }
      }
    } catch (err) {
      console.error("Award XP API error:", err);
    }
  };

  const updateUserStatsState = (stats: Partial<UserStats>) => {
    if (user) {
      const updated = { ...user, ...stats };
      setUser(updated);
      localStorage.setItem('sheldon_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshStats, awardXP, updateUserStatsState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
