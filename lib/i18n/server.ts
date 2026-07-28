import { cookies } from 'next/headers';
import { getMessagesApi, getCurrenciesApi, type Messages, type SupportedCurrency } from '@/lib/localization-api';
import { FALLBACK_EN } from './fallback-en';

const COOKIE_NAME = 'govt_locale';

export function getLocaleFromCookie(): { language: string; currency: string } {
  try {
    const raw = cookies().get(COOKIE_NAME)?.value;
    if (!raw) return { language: 'en', currency: 'INR' };
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return { language: 'en', currency: 'INR' };
  }
}

export async function getServerMessages(lang?: string): Promise<Messages> {
  const resolved = lang ?? getLocaleFromCookie().language;
  const messages = await getMessagesApi(resolved);
  return Object.keys(messages).length > 0 ? messages : FALLBACK_EN;
}

export function buildServerT(messages: Messages) {
  return (key: string, vars?: Record<string, string | number>): string => {
    const parts = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let node: any = messages;
    for (const part of parts) {
      if (node == null || typeof node !== 'object') return key;
      node = node[part];
    }
    let str = typeof node === 'string' ? node : key;
    if (vars) {
      str = str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
    }
    return str;
  };
}

export async function getServerFormatMoney(currency?: string): Promise<(amountInr: number) => string> {
  const code = currency ?? getLocaleFromCookie().currency;
  let curr: SupportedCurrency | undefined;
  try {
    const list = await getCurrenciesApi();
    curr = list.find(c => c.code === code);
  } catch { /* fall back */ }

  const rate    = curr?.rate_per_inr ?? 1;
  const locale  = curr?.locale ?? 'en-IN';
  const digits  = curr?.decimal_digits ?? 2;
  const safeCurr = curr ? code : 'INR';

  return (amountInr: number) => {
    const converted = amountInr * rate;
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurr,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(converted);
  };
}
