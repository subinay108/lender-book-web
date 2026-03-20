import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: { default: 'LenderBook', template: '%s · LenderBook' },
  description: 'Simple digital ledger for local money lenders',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#c9901a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <AuthProvider>
          {children}
          <ToastContainer position="top-right" limit={3} />
        </AuthProvider>
      </body>
    </html>
  );
}
