// src/auth/AuthProvider.tsx
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Grid } from 'antd'
import type { User, Ctx} from '../types/index.types';

function parseJwt(token: string) {
  try {
    const [, p] = token.split('.');
    return JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
  } catch { return {}; }
}



export const AuthContext = createContext<Ctx>({
  user: null, token: null, setAuth: () => {}, logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(() => {
    const s = localStorage.getItem('currentUser');
    return s ? JSON.parse(s) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('accessToken'));
  const expiryTimer = useRef<number | null>(null);
   // Check if the screen is mobile
    const { useBreakpoint } = Grid;
    const screens = useBreakpoint();
    const isMobile = !screens.md; // true for <768px

  const clearTimer = () => { if (expiryTimer.current) window.clearTimeout(expiryTimer.current); expiryTimer.current = null; };





 




  const logout = useCallback(() => {
    clearTimer();
    setUser(null);
    setToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('currentUser');
    window.location.assign('/login');
  }, []);

  const setAuth = useCallback((t: string, u: NonNullable<User>) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('accessToken', t);
    localStorage.setItem('currentUser', JSON.stringify(u));
  }, []);

  useEffect(() => {
    clearTimer();
    if (!token) return;
    const { exp } = parseJwt(token);
    if (!exp) return;
    const skew = 5000;
    const ms = exp * 1000 - Date.now() - skew;
    if (ms <= 0) { logout(); return; }
    expiryTimer.current = window.setTimeout(() => logout(), ms);
    return clearTimer;
  }, [token, logout]);

  const value = useMemo(() => ({ user, token, setAuth, logout, isMobile }), [user, token, setAuth, logout, isMobile ]);


  return <AuthContext.Provider value={{ ...value}}>{children}</AuthContext.Provider>;
}


export function getToken(){
  const { token } = React.useContext(AuthContext);
  return token;
}



export function getUser(){
  const { user } = React.useContext(AuthContext);
  return user;
}