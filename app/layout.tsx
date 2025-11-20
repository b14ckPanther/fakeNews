import type { Metadata } from 'next';
import './globals.css';
import { LocalizationProvider } from '@/lib/localization';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Fake News Seminar Game',
  description: 'Interactive game for fake news education',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;500;700&family=Heebo:wght@400;500;700&family=Cairo:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <LocalizationProvider>{children}</LocalizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

