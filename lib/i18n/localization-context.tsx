'use client';

import {
  createContext, useContext, useEffect, useState, useCallback,
  useRef, type ReactNode,
} from 'react';
import { useAuth } from '@/lib/auth-context';
import { updateProfileApi } from '@/lib/account-api';
import {
  getLanguagesApi, getMessagesApi, getCurrenciesApi,
  type SupportedLanguage, type SupportedCurrency, type Messages,
} from '@/lib/localization-api';
import { FALLBACK_EN } from './fallback-en';

const COOKIE_NAME = 'govt_locale';

function readLocaleCookie(): { language: string; currency: string } {
  if (typeof document === 'undefined') return { language: 'en', currency: 'INR' };
  const match = document.cookie.split('; ').find(c => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return { language: 'en', currency: 'INR' };
  try {
    return JSON.parse(decodeURIComponent(match.slice(COOKIE_NAME.length + 1)));
  } catch {
    return { language: 'en', currency: 'INR' };
  }
}

function writeLocaleCookie(language: string, currency: string) {
  const value = encodeURIComponent(JSON.stringify({ language, currency }));
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

interface LocalizationContextValue {
  language: string;
  currency: string;
  languages: SupportedLanguage[];
  currencies: SupportedCurrency[];
  t: (key: string, vars?: Record<string, string | number>) => string;
  formatMoney: (amountInr: number) => string;
  setLanguage: (code: string) => Promise<void>;
  setCurrency: (code: string) => Promise<void>;
  isLoading: boolean;
}

const LocalizationContext = createContext<LocalizationContextValue | null>(null);

function lookup(messages: Messages, key: string): string | null {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let node: any = messages;
  for (const part of parts) {
    if (node == null || typeof node !== 'object') return null;
    node = node[part];
  }
  return typeof node === 'string' ? node : null;
}

function buildT(messages: Messages) {
  return (key: string, vars?: Record<string, string | number>): string => {
    let str = lookup(messages, key) ?? lookup(FALLBACK_EN, key) ?? key;
    if (vars) {
      str = str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
    }
    return str;
  };
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  const [language, setLang]     = useState('en');
  const [currency, setCurr]     = useState('INR');
  const [messages, setMessages] = useState<Messages>(FALLBACK_EN);
  const [languages, setLanguages] = useState<SupportedLanguage[]>([]);
  const [currencies, setCurrencies] = useState<SupportedCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ratesRef = useRef<Record<string, number>>({ INR: 1 });

  useEffect(() => {
    const cookie = readLocaleCookie();
    setLang(cookie.language);
    setCurr(cookie.currency);

    Promise.all([
      getLanguagesApi(),
      getCurrenciesApi(),
      getMessagesApi(cookie.language),
    ]).then(([langs, currs, msgs]) => {
      setLanguages(langs);
      setCurrencies(currs);
      setMessages(msgs);
      const idx: Record<string, number> = { INR: 1 };
      for (const c of currs) idx[c.code] = c.rate_per_inr;
      ratesRef.current = idx;
    }).finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncedRef = useRef(false);
  useEffect(() => {
    if (!user || syncedRef.current) return;
    syncedRef.current = true;
    const userLang = user.language ?? 'en';
    const userCurr = user.currency ?? 'INR';
    if (userLang !== language || userCurr !== currency) {
      setLang(userLang);
      setCurr(userCurr);
      writeLocaleCookie(userLang, userCurr);
      if (userLang !== language) {
        getMessagesApi(userLang).then(setMessages);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const setLanguage = useCallback(async (code: string) => {
    setLang(code);
    writeLocaleCookie(code, currency);
    const msgs = await getMessagesApi(code);
    setMessages(msgs);
    if (user) {
      updateProfileApi(user.id, { language: code }).catch(() => {});
    }
  }, [currency, user]);

  const setCurrency = useCallback(async (code: string) => {
    setCurr(code);
    writeLocaleCookie(language, code);
    if (user) {
      updateProfileApi(user.id, { currency: code }).catch(() => {});
    }
  }, [language, user]);

  const t = useCallback(buildT(messages), [messages]);

  const formatMoney = useCallback((amountInr: number): string => {
    const rate = ratesRef.current[currency] ?? 1;
    const converted = amountInr * rate;
    const curr = currencies.find(c => c.code === currency);
    const locale = curr?.locale ?? 'en-IN';
    const digits = curr?.decimal_digits ?? 2;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(converted);
  }, [currency, currencies]);

  useEffect(() => {
    if (currencies.length) {
      const idx: Record<string, number> = { INR: 1 };
      for (const c of currencies) idx[c.code] = c.rate_per_inr;
      ratesRef.current = idx;
    }
  }, [currencies]);

  return (
    <LocalizationContext.Provider value={{
      language, currency, languages, currencies,
      t, formatMoney, setLanguage, setCurrency, isLoading,
    }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error('useLocalization must be used within LocalizationProvider');
  return ctx;
}

export function useT() {
  return useLocalization().t;
}
