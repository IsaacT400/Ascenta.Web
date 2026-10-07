'use client';
import type { ReactNode } from 'react';
import { AppProvider } from './context';
import { Header, Footer, ReviewIndicator } from './chrome';
import { Notice } from './ui';
/** Shared shell; Vinext owns the route rendering. */
export function AscentaApp({ children }: { children: ReactNode }) {
  return <AppProvider><div className="ascenta"><Header /><main id="main-content" tabIndex={-1}>{children}</main><Footer /><Notice /><ReviewIndicator /></div></AppProvider>;
}
