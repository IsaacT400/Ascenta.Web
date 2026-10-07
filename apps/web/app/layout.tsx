import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AscentaApp } from '@/components/ascenta/App';
import './ascenta.css';
export const metadata: Metadata = {
  title: { default: 'ASCENTA — Executive Transportation', template: '%s | ASCENTA' },
  description: 'Executive transportation. Begin a journey with clarity, care and a personal sense of direction.',
  icons: { icon: '/brand/favicon.png', shortcut: '/brand/favicon.png' },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><AscentaApp>{children}</AscentaApp></body></html>;
}
