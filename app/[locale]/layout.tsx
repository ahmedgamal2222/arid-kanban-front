import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import { locales } from '@/i18n/request';
import Providers from '@/components/Providers';
import './globals.css';

const ibmArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const messages = (await import(`../../messages/${locale}.json`)).default as Record<string, any>;
  const meta = messages?.meta ?? {};
  return {
    title: meta.title ?? 'ARID Kanban',
    description: meta.description ?? '',
  };
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({ children, params: { locale } }: Props) {
  if (!locales.includes(locale as any)) notFound();

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning
      className={`${ibmArabic.variable} ${inter.variable}`}>
      <body className="font-sans bg-surface text-content antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
