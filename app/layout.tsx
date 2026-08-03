import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import { cookies } from 'next/headers';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/components/theme-provider';
import { LocalizationProvider } from '@/lib/i18n/localization-context';
import GlobalLoadingOverlay from '@/components/loading/global-loading-overlay';
import { BRAND } from '@/lib/brand';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter-tight',
});

export const metadata: Metadata = {
  title: `${BRAND.name} ${BRAND.productName}`,
  description: `Platform-wide admin console for ${BRAND.name}.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  let lang = 'en';
  try {
    const raw = cookies().get('quiliss_locale')?.value;
    if (raw) lang = JSON.parse(decodeURIComponent(raw)).language ?? 'en';
  } catch { /* use default */ }

  const brandStyle = {
    '--color-brand':      BRAND.primaryRgb,
    '--color-brand-dark': BRAND.primaryDarkRgb,
  } as React.CSSProperties;

  return (
    <html lang={lang} className={`${inter.variable} ${interTight.variable}`} suppressHydrationWarning>
      <body className="bg-bg text-neutral-primary font-sans" style={brandStyle}>
        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
          <AuthProvider>
            <LocalizationProvider>
              <GlobalLoadingOverlay />
              {children}
            </LocalizationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
