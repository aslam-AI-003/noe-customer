import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeScript } from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: 'NammaOoru Express — Fast Local Delivery',
  description: 'Order groceries, food, medicine & more from local shops in Thanjavur & Kumbakonam. Delivered in 30 minutes.',
  keywords: 'delivery, groceries, food, medicine, Thanjavur, Kumbakonam, Tamil Nadu',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0B0D' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Theme initialization script — runs before page renders to prevent flash */}
        <ThemeScript />
      </head>
      <body className="bg-white text-[#16181D] antialiased transition-colors duration-300">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#16181D',
              border: '1px solid rgba(17,24,39,0.08)',
              borderRadius: '14px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 16px 40px rgba(17,24,39,0.12)',
            },
            success: {
              iconTheme: { primary: '#F97316', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
