import type { Metadata } from 'next';

import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { BASE_URL } from '@/constants/configs';
import { QueryProvider } from '@/providers/QueryProvider';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const translate = await getTranslations({ locale });

  return {
    title: {
      default: translate('seoTitle'),
      template: `%s | ${translate('appTitle')}`,
    },
    description: translate('seoDescription'),
    keywords: translate('seoKeywords'),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
    },
    openGraph: {
      title: translate('seoTitle'),
      description: translate('seoDescription'),
      locale,
      type: 'website',
      url: `${BASE_URL}/${locale}`,
    },
  };
};

const LocaleLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'en' | 'hy' | 'ru')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.variable}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            {children}
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
