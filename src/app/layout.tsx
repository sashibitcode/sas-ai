import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SAS AI - Created by SHASHIKANT RAJ (sashibitcode)',
  description:
    'An intelligent, ChatGPT-like AI assistant created by SHASHIKANT RAJ (sashibitcode) with real-time streaming, photo analysis, image generation, and multilingual support.',
  keywords: ['SAS AI', 'SHASHIKANT RAJ', 'sashibitcode', 'AI Chat', 'ChatGPT Clone', 'Llama 3.2', 'Hinglish AI'],
  authors: [{ name: 'SHASHIKANT RAJ (sashibitcode)' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#080b12',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased text-[#ececec] bg-[#191919] selection:bg-[#20b8cd]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
