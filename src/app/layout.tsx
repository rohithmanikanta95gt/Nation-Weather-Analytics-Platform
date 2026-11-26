import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'National Weather Big Data Analytics Platform | NWAP India',
  description:
    'Real-time centralized weather intelligence and disaster monitoring platform for India. Aggregating IMD radar, satellite telemetry, citizen reports, and AI verification.',
  keywords: [
    'Weather Big Data',
    'India Weather Intelligence',
    'Disaster Management',
    'IMD Telemetry',
    'Flood Warning',
    'Weather Analytics',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-[#090d16] dark:text-slate-100 transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
