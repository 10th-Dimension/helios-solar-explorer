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

const title = 'HELIOS — Solar System and Nearby Stars';
const description =
  'Explore the Sun, planets and their interiors, nearby stars and curated exoplanets in 3D, with guided lessons and scientific sources.';

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  ),
  openGraph: {
    title,
    description,
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'HELIOS Solar System Explorer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
