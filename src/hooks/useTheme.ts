import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Theme, ResolvedTheme, StyleVariant } from '../types';
import { loadStyle, loadTheme, saveStyle, saveTheme } from '../lib/storage';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  cycleTheme: () => void;
  style: StyleVariant;
  cycleStyle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const DARK_META = '#18161F';
const LIGHT_META = '#F4EFE5';

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolve(theme: Theme, systemDark: boolean): ResolvedTheme {
  if (theme === 'system') return systemDark ? 'dark' : 'light';
  return theme;
}

function applyTheme(resolved: ResolvedTheme): void {
  document.documentElement.setAttribute('data-theme', resolved);
  const meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (meta) meta.setAttribute('content', resolved === 'dark' ? DARK_META : LIGHT_META);
}

function applyStyle(style: StyleVariant): void {
  document.documentElement.setAttribute('data-style', style);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => loadTheme());
  const [style, setStyleState] = useState<StyleVariant>(() => loadStyle());
  const [systemDark, setSystemDark] = useState<boolean>(() => systemPrefersDark());

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolvedTheme = useMemo<ResolvedTheme>(() => resolve(theme, systemDark), [theme, systemDark]);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    applyStyle(style);
  }, [style]);

  useEffect(() => {
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveStyle(style);
  }, [style]);

  const cycleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
  }, []);

  const cycleStyle = useCallback(() => {
    setStyleState((prev) => (prev === 'classic' ? 'atlas' : 'classic'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, cycleTheme, style, cycleStyle }),
    [theme, resolvedTheme, cycleTheme, style, cycleStyle],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
