'use client';
import * as React from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { DEFAULT_ZONE, DRAFT_STORAGE_KEY, DRAFT_TTL_MS, safeReturn } from './platform';
import { api, ApiError } from './adapter-api';
import type { Catalog, JourneyDraft, Language, Runtime, User } from './types';
export { api, ApiError } from './adapter-api';

export const makeDraft = (): JourneyDraft => ({ serviceTypeCode: 'ONE_WAY', vehicleClassCode: '', pickupAddress: '', destinationAddress: '', date: '', time: '', zone: DEFAULT_ZONE,
  returnDate: '', returnTime: '', passengers: 1, luggage: 0, hours: 2, flightNumber: '', flightDirection: 'ARRIVAL', passengerName: '', passengerEmail: '', passengerPhone: '', notes: '', organizationId: '', key: '', createdAt: 0, submissionUncertain: false });
function loadDraft(): JourneyDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return makeDraft();
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !('version' in parsed) || parsed.version !== 1 || !('expires' in parsed) || typeof parsed.expires !== 'number' || !Number.isFinite(parsed.expires) || parsed.expires <= Date.now() || !('draft' in parsed) || !parsed.draft || typeof parsed.draft !== 'object') {
      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      return makeDraft();
    }
    const draft: Record<string, unknown> = { ...parsed.draft };
    const str = (key: string, fallback = '') => typeof draft[key] === 'string' && draft[key].length <= 3000 ? draft[key] : fallback;
    const num = (key: string, fallback: number, min: number, max: number) => typeof draft[key] === 'number' && Number.isFinite(draft[key]) && draft[key] >= min && draft[key] <= max ? draft[key] : fallback;
    return { ...makeDraft(), serviceTypeCode: ['ONE_WAY', 'AIRPORT_TRANSFER', 'HOURLY', 'ROUND_TRIP', 'CITY_TO_CITY'].includes(str('serviceTypeCode')) ? str('serviceTypeCode') : 'ONE_WAY', vehicleClassCode: str('vehicleClassCode'), pickupAddress: str('pickupAddress'), destinationAddress: str('destinationAddress'), date: str('date'), time: str('time'), zone: str('zone', DEFAULT_ZONE), returnDate: str('returnDate'), returnTime: str('returnTime'), passengers: num('passengers', 1, 1, 50), luggage: num('luggage', 0, 0, 50), hours: num('hours', 2, 1, 24), flightNumber: str('flightNumber'), flightDirection: str('flightDirection', 'ARRIVAL'), passengerName: str('passengerName'), passengerEmail: str('passengerEmail'), passengerPhone: str('passengerPhone'), notes: str('notes'), organizationId: str('organizationId'), key: str('key'), createdAt: num('createdAt', 0, 0, Date.now()), submissionUncertain: draft.submissionUncertain === true, occurrence: draft.occurrence === 0 || draft.occurrence === 1 ? draft.occurrence : undefined, returnOccurrence: draft.returnOccurrence === 0 || draft.returnOccurrence === 1 ? draft.returnOccurrence : undefined };
  } catch { return makeDraft(); }
}
type Notice = { id: number; message: string };
type AppState = {
  lang: Language; setLang: (value: Language) => void; t: (en: string, es: string) => string; path: string;
  navigate: (to: string) => void; user: User | null; authLoading: boolean; authError: boolean; refreshUser: () => Promise<User | null>; logout: () => Promise<void>;
  runtime: Runtime | null; catalog: Catalog | null; catalogError: boolean; refreshCatalog: () => Promise<void>;
  draft: JourneyDraft; updateDraft: (changes: Partial<JourneyDraft>) => void; clearDraft: () => void; ready: boolean;
  notice: Notice | null; notify: (message: string) => void; dismissNotice: () => void; storageWarning: boolean;
};
const AppContext = React.createContext<AppState | null>(null);
export function useApp(): AppState {
  const context = React.useContext(AppContext);
  if (!context) throw new Error('ASCENTA provider missing.');
  return context;
}
export function AppProvider({ children, initialPath = '/' }: { children: React.ReactNode; initialPath?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const path = pathname ?? initialPath;
  const [lang, changeLang] = React.useState<Language>('en');
  const [user, setUser] = React.useState<User | null>(null);
  const [authLoading, setAuthLoading] = React.useState(true);
  const [authError, setAuthError] = React.useState(false);
  const [runtime, setRuntime] = React.useState<Runtime | null>(null);
  const [catalog, setCatalog] = React.useState<Catalog | null>(null);
  const [catalogError, setCatalogError] = React.useState(false);
  const [draft, setDraft] = React.useState<JourneyDraft>(makeDraft);
  const [ready, setReady] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice | null>(null);
  const [storageWarning, setStorageWarning] = React.useState(false);
  const authGeneration = React.useRef(0);
  const dismissNotice = React.useCallback(() => setNotice(null), []);
  const t = React.useCallback((en: string, es: string) => lang === 'en' ? en : es, [lang]);
  const refreshUser = React.useCallback(async () => {
    const generation = ++authGeneration.current;
    setAuthError(false);
    try {
      const result = await api('/auth/me');
      if (generation !== authGeneration.current) return null;
      setUser(result.user); return result.user;
    }
    catch (error) {
      if (generation !== authGeneration.current) return null;
      if (error instanceof ApiError && error.status === 401) { setUser(null); return null; }
      setAuthError(true); return null;
    } finally { if (generation === authGeneration.current) setAuthLoading(false); }
  }, []);
  const refreshCatalog = React.useCallback(async () => {
    setCatalogError(false);
    try { setCatalog(await api('/catalog')); } catch { setCatalogError(true); }
  }, []);
  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try { if (localStorage.getItem('ascenta.language') === 'es') changeLang('es'); } catch { /* optional preference */ }
      setDraft(loadDraft()); setReady(true);
      void refreshUser(); void refreshCatalog();
      void api('/runtime').then(setRuntime).catch(() => setRuntime(null));
    });
    const storageListener = (event: StorageEvent) => { if (event.key === 'ascenta.auth-event') void refreshUser(); };
    const visibility = () => { if (document.visibilityState === 'visible') void refreshUser(); };
    window.addEventListener('storage', storageListener); document.addEventListener('visibilitychange', visibility);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('storage', storageListener); document.removeEventListener('visibilitychange', visibility); };
  }, [refreshUser, refreshCatalog]);
  React.useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  React.useEffect(() => {
    if (!ready) return;
    let warningFrame: number | undefined;
    try {
      if (!draft.createdAt) sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      else sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ version: 1, expires: draft.createdAt + DRAFT_TTL_MS, draft }));
    } catch { warningFrame = requestAnimationFrame(() => setStorageWarning(true)); }
    return () => { if (warningFrame !== undefined) cancelAnimationFrame(warningFrame); };
  }, [draft, ready]);
  React.useEffect(() => {
    if (!ready || !draft.createdAt) return;
    const remaining = draft.createdAt + DRAFT_TTL_MS - Date.now();
    const timer = setTimeout(() => { setDraft(makeDraft()); setNotice({ id: Date.now(), message: t('The 30-minute draft expired. Please enter the journey again.', 'El borrador de 30 minutos venció. Ingresa el viaje de nuevo.') }); }, Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [draft.createdAt, ready, t]);
  const navigate = React.useCallback((to: string) => {
    const target = new URL(to, window.location.origin);
    if (target.origin !== window.location.origin) return;
    router.push(target.pathname + target.search + target.hash);
  }, [router]);
  const setLang = (value: Language) => { changeLang(value); try { localStorage.setItem('ascenta.language', value); } catch { /* optional preference */ } };
  const updateDraft = React.useCallback((changes: Partial<JourneyDraft>) => setDraft(old => old.submissionUncertain ? old : ({ ...old, ...changes, createdAt: old.createdAt || Date.now(), key: old.key || crypto.randomUUID() })), []);
  const clearDraft = React.useCallback(() => { setDraft(makeDraft()); try { sessionStorage.removeItem(DRAFT_STORAGE_KEY); } catch { /* optional storage */ } }, []);
  const logout = async () => {
    ++authGeneration.current;
    await api('/auth/logout', {});
    ++authGeneration.current;
    setAuthLoading(false); setAuthError(false); setUser(null); clearDraft();
    try { localStorage.setItem('ascenta.auth-event', String(Date.now())); } catch { /* optional storage */ }
    navigate('/'); setNotice({ id: Date.now(), message: t('You are signed out.', 'Has cerrado sesión.') });
  };
  return <AppContext.Provider value={{ lang, setLang, t, path, navigate, user, authLoading, authError, refreshUser, logout, runtime, catalog, catalogError, refreshCatalog, draft, updateDraft, clearDraft, ready, notice, notify: message => setNotice({ id: Date.now(), message }), dismissNotice, storageWarning }}>{children}</AppContext.Provider>;
}
export function Link({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return href.startsWith('/') || href.startsWith('#') ? <NextLink href={href} {...props} /> : <a href={href} {...props} />;
}
export function loginDestination(next = '/booking', mode?: string) { return `/login?next=${encodeURIComponent(safeReturn(next))}${mode ? `&mode=${encodeURIComponent(mode)}` : ''}`; }
