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
  title: 'Helios — Solar System Explorer',
  description: 'Navigate a living 3D model of the Solar System, then explore what each world is really like.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Helios — Solar System Explorer',
    description: 'Navigate a living 3D model of the Solar System, then explore what each world is really like.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Helios Solar System Explorer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Helios — Solar System Explorer',
    description: 'Navigate a living 3D model of the Solar System, then explore what each world is really like.',
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
