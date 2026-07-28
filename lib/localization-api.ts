import { API_BASE } from './api-base';
const BASE_URL = API_BASE;

export interface SupportedLanguage {
  code: string;
  nativeName: string;
  englishName: string;
}

export interface SupportedCurrency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimal_digits: number;
  rate_per_inr: number;
}

export type Messages = Record<string, Record<string, string>>;

export async function getLanguagesApi(): Promise<SupportedLanguage[]> {
  try {
    const res = await fetch(`${BASE_URL}/localization/languages`, { cache: 'force-cache' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.languages ?? [];
  } catch {
    return [];
  }
}

export async function getMessagesApi(lang: string): Promise<Messages> {
  try {
    const res = await fetch(`${BASE_URL}/localization/messages/${encodeURIComponent(lang)}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data.messages ?? {};
  } catch {
    return {};
  }
}

export async function getCurrenciesApi(): Promise<SupportedCurrency[]> {
  try {
    const res = await fetch(`${BASE_URL}/localization/currencies`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.currencies ?? [];
  } catch {
    return [];
  }
}
