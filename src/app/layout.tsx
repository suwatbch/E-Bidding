import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { UserProvider } from './contexts/UserContext';
import { LanguageProvider } from './contexts/LanguageContext';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'E-Bidding System',
  description: 'ระบบประมูลออนไลน์',
  icons: {
    icon: [
      {
        url: '/eicon.svg',
        type: 'image/svg+xml',
        media: '(prefers-color-scheme: light)',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <head>
        <link rel="icon" href="/eicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          <UserProvider>{children}</UserProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
