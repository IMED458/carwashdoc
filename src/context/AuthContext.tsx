/**
 * ავტორიზაციის კონტექსტი — ინახავს აქტიურ მომხმარებელს და მართავს სესიას.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import {
  ensureBootstrapAdmin,
  restoreSession,
  login as loginService,
  logout as logoutService,
} from '../services/auth';

interface AuthContextValue {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // timeout, რომ აპლიკაცია არასდროს გაიჭედოს spinner-ზე Firestore-ის დაგვიანების დროს
    const withTimeout = <T,>(p: Promise<T>, ms: number, fallback: T): Promise<T> =>
      Promise.race([
        p,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
      ]);

    (async () => {
      try {
        await withTimeout(ensureBootstrapAdmin().catch(() => {}), 8000, undefined);
        const restored = await withTimeout(
          restoreSession().catch(() => null),
          8000,
          null,
        );
        setCurrentUser(restored);
      } catch (e) {
        console.error('Auth init error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    const user = await loginService(username, password);
    setCurrentUser(user);
  };

  const logout = () => {
    logoutService();
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
