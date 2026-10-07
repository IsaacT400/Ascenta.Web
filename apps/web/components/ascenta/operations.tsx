'use client';
import * as React from 'react';
import { api, Link, useApp } from './context';
import { Alert, Button, EmptyState, ErrorMessage, Field, Icon, Loading } from './ui';
import { AccountGuard, JourneyCard, PortalShell } from './portal';
import type { Reservation } from './types';

export function OperationsPage() { const { user } = useApp(); return <AccountGuard internal><Operations key={user?.id} /></AccountGuard>; }
function Operations() {
  const { t, runtime } = useApp();
  const [rows, setRows] = React.useState<Reservation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<unknown>(null);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('ALL');
  const refresh = React.useCallback(async () => { setLoading(true); setError(null); try { setRows(await api('/operations/requests')); } catch (reason) { setRows([]); setError(reason); } finally { setLoading(false); } }, []);
  React.useEffect(() => { const frame = requestAnimationFrame(() => { void refresh(); }); return () => cancelAnimationFrame(frame); }, [refresh]);
  const visible = rows.filter(row => (status === 'ALL' || row.status === status) && `${row.reference} ${row.passengerName ?? ''} ${row.requesterName ?? ''} ${row.pickupAddress} ${row.destinationAddress ?? ''}`.toLowerCase().includes(query.toLowerCase()));
  return <PortalShell internal><div className="portal-heading"><div><p className="eyebrow">ASCENTA OPERATIONS</p><h1>{t('Every request, in view.', 'Cada solicitud, a la vista.')}</h1><p>{t('An internal workspace. Separate from customer accounts.', 'Un espacio interno. Separado de las cuentas de clientes.')}</p></div><Button tone="secondary" disabled={loading} onClick={() => void refresh()}><Icon name="refresh" />{t('Refresh', 'Actualizar')}</Button></div>
    <Alert>{t('Requests are available for review. Quotations, status changes, payments and dispatch are not enabled.', 'Las solicitudes están disponibles para consulta. Las cotizaciones, los cambios de estado, los pagos y el despacho no están habilitados.')}</Alert>
    {runtime?.reviewMode && <p className="illustration-note">{t('Demo records are retained only while the local service is running.', 'Los registros de demostración se conservan mientras el servicio local está activo.')}</p>}
    <div className="field-grid"><Field label={t('Search', 'Buscar')} id="ops-search"><input id="ops-search" type="search" value={query} onChange={event => setQuery(event.target.value)} /></Field><Field label={t('Status', 'Estado')} id="ops-status"><select id="ops-status" value={status} onChange={event => setStatus(event.target.value)}>{['ALL', 'DRAFT', 'REQUESTED', 'QUOTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(value => <option key={value} value={value}>{value === 'ALL' ? t('All statuses', 'Todos los estados') : value}</option>)}</select></Field></div>
    <div className="portal-toolbar"><p>{t('Requests', 'Solicitudes')}: {visible.length}</p></div><ErrorMessage error={error} />
    {loading ? <Loading /> : error ? null : !visible.length ? <EmptyState title={t('The queue is clear.', 'La cola está vacía.')}>{t('Submitted requests matching this view will appear here.', 'Las solicitudes enviadas que coincidan con esta vista aparecerán aquí.')}</EmptyState> : <div className="request-list">{visible.map(row => <JourneyCard row={row} key={row.id} />)}</div>}
  </PortalShell>;
}
export function DevelopmentInbox() {
  const { t } = useApp();
  return <section className="inner-page container paper-page" data-nav-theme="light"><div className="page-heading"><p className="eyebrow">{t('ACCOUNT VERIFICATION', 'VERIFICACIÓN DE CUENTA')}</p><h1>{t('Verify your account.', 'Verifica tu cuenta.')}</h1><p>{t('A development verification link is shown after a successful local registration. An email inbox and password recovery are not connected.', 'Después de un registro local correcto se muestra un enlace de verificación de desarrollo. No hay bandeja de correo ni recuperación de contraseña conectadas.')}</p></div><div className="page-actions"><Link className="button button-primary" href="/login?mode=register">{t('Create account', 'Crear cuenta')}</Link><Link href="/login">{t('Back to sign in', 'Volver a iniciar sesión')}</Link></div></section>;
}
