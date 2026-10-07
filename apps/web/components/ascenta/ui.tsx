'use client';
import * as React from 'react';
import { useApp, ApiError } from './context';
import { PlatformError } from './platform';
export function Icon({ name, size = 20, ...props }: React.SVGProps<SVGSVGElement> & { name: string; size?: number }) {
    const paths: Record<string, React.ReactNode> = {
        arrow: <React.Fragment><path d={"M4 12h15M13 5l7 7-7 7"}/></React.Fragment>,
        'arrow-left': <path d={"M20 12H5m6-7-7 7 7 7"}/>,
        chevron: <path d={"m8 4 8 8-8 8"}/>,
        pin: <React.Fragment><path d={"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"}/>
        <circle cx={"12"} cy={"10"} r={"2.5"}/></React.Fragment>,
        calendar: <React.Fragment><rect x={"3"} y={"5"} width={"18"} height={"16"} rx={"2"}/>
        <path d={"M7 2v6m10-6v6M3 11h18m-12 4h2m4 0h2"}/></React.Fragment>,
        clock: <React.Fragment><circle cx={"12"} cy={"12"} r={"9"}/>
        <path d={"M12 7v6l4 2"}/></React.Fragment>,
        user: <React.Fragment><circle cx={"12"} cy={"8"} r={"4"}/>
        <path d={"M4 22v-2a8 8 0 0 1 16 0v2"}/></React.Fragment>,
        users: <React.Fragment><circle cx={"9"} cy={"8"} r={"3"}/>
        <path d={"M2 21v-2a7 7 0 0 1 14 0v2m1-16a3 3 0 0 1 0 6m2 4a6 6 0 0 1 3 6"}/></React.Fragment>,
        plane: <React.Fragment><path d={"m21 3-7 18-3-8-8-3L21 3ZM11 13 21 3"}/></React.Fragment>,
        bag: <React.Fragment><rect x={"4"} y={"7"} width={"16"} height={"15"} rx={"2"}/>
        <path d={"M8 7V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M8 11v7m8-7v7"}/></React.Fragment>,
        building: <React.Fragment><rect x={"5"} y={"2"} width={"14"} height={"20"} rx={"1"}/>
        <path d={"M9 6h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1m-5 8v-4h4v4"}/></React.Fragment>,
        check: <path d={"m5 12 4 4L20 5"}/>,
        close: <path d={"m6 6 12 12M6 18 18 6"}/>,
        menu: <path d={"M3 6h18M3 12h18M3 18h18"}/>,
        mail: <React.Fragment><rect x={"2"} y={"4"} width={"20"} height={"16"} rx={"2"}/>
        <path d={"m3 6 9 7 9-7"}/></React.Fragment>,
        shield: <React.Fragment><path d={"M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6L12 2Z"}/>
        <path d={"m8 12 3 3 5-6"}/></React.Fragment>,
        globe: <React.Fragment><circle cx={"12"} cy={"12"} r={"10"}/>
        <ellipse cx={"12"} cy={"12"} rx={"4"} ry={"10"}/>
        <path d={"M2 12h20"}/></React.Fragment>,
        car: <React.Fragment><path d={"m4 9 2-6h12l2 6M2 9h20v10H2V9Zm3 10v3m14-3v3M5 13h2m10 0h2"}/></React.Fragment>,
        van: <React.Fragment><rect x={"2"} y={"4"} width={"20"} height={"14"} rx={"2"}/>
        <path d={"M6 4v8h16M4 18v3m16-3v3M6 15h1m11 0h1M13 4v8"}/></React.Fragment>,
        info: <React.Fragment><circle cx={"12"} cy={"12"} r={"10"}/>
        <path d={"M12 11v6m0-10v.1"}/></React.Fragment>,
        refresh: <React.Fragment><path d={"M20 7a9 9 0 1 0 1 8M20 2v5h-5"}/></React.Fragment>,
        logout: <React.Fragment><path d={"M9 3H3v18h6m6-14 5 5-5 5M8 12h12"}/></React.Fragment>,
        eye: <React.Fragment><path d={"M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"}/>
        <circle cx={"12"} cy={"12"} r={"3"}/></React.Fragment>,
        download: <React.Fragment><path d={"M12 2v13m-5-5 5 5 5-5M3 16v5h18v-5"}/></React.Fragment>,
    };
    return <svg width={size} height={size} viewBox={"0 0 24 24"} fill={"none"} stroke={"currentColor"} strokeWidth={"1.5"} strokeLinecap={"round"} strokeLinejoin={"round"} aria-hidden={"true"} focusable={"false"} {...props}>{paths[name] ?? paths.info}</svg>;
}
export function Brand({ full = false }: { full?: boolean }) {
    return <img className={`brand-image ${full ? 'brand-image-full' : ''}`} src={full ? "/brand/logo-lockup.png" : "/brand/logo-wordmark.png"} alt={"ASCENTA \u2014 Executive Transportation"} width={full ? 1081 : 1081} height={full ? 553 : 222}/>;
}
export function Button({ children, tone = 'primary', className = '', busy, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: 'primary' | 'secondary' | 'quiet' | 'light'; busy?: boolean }) {
    return <button className={`button button-${tone} ${className}`} type={"button"} aria-busy={busy || undefined} {...props} disabled={busy || props.disabled}>{busy && <span className={"spinner"} aria-hidden={"true"}/>}
    {children}</button>;
}
export function Field({ label, hint, error, children, className = '', id }: { label: React.ReactNode; hint?: React.ReactNode; error?: React.ReactNode; children: React.ReactNode; className?: string; id?: string }) {
    return <div className={`field ${error ? 'has-error' : ''} ${className}`}><label htmlFor={id}>{label}</label>
    {children}
    {hint && <small className={"field-hint"} id={id ? `${id}-hint` : undefined}>{hint}</small>}
    {error && <small className={"field-error"} id={id ? `${id}-error` : undefined}>{error}</small>}</div>;
}
export function Alert({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'error' | 'success' }) {
    return <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}><Icon name={type === 'success' ? 'check' : 'info'}/>
    <div>{children}</div></div>;
}
export function ErrorMessage({ error }: { error: unknown }) {
    const { t } = useApp();
    if (!error)
        return null;
    const translations: Record<string, string> = {
        NETWORK_ERROR: 'No hay conexión. El borrador no se ha descartado.', CREDENTIALS_INVALID: 'El correo o la contraseña no son correctos.',
        AUTH_REQUIRED: 'Inicia sesión para continuar.', EMAIL_UNVERIFIED: 'Verifica tu correo antes de enviar. El borrador continúa en esta pestaña.',
        CSRF_INVALID: 'La sesión cambió. Actualiza la página e inténtalo de nuevo.', TOKEN_INVALID: 'Este enlace no es válido, venció o ya se utilizó.',
        EMAIL_NOT_CONFIGURED: 'El correo transaccional no está configurado. No se ha enviado ningún correo.', RATE_LIMITED: 'Demasiados intentos. Espera antes de volver a intentarlo.',
        TIME_INVALID: 'Esa hora no existe en la zona horaria elegida. Selecciona otra.', TIME_AMBIGUOUS: 'Esa hora ocurre dos veces. Selecciona la primera o la segunda.',
        IDEMPOTENCY_CONFLICT: 'La clave de envío ya se utilizó con otros datos. Revisa tus solicitudes antes de empezar otra.',
        STALE_RECORD: 'La solicitud cambió. Actualiza los datos antes de volver a intentarlo.', FORBIDDEN: 'No tienes permiso para esta acción.',
        VALIDATION_FAILED: 'Revisa los campos indicados.', REQUESTS_DISABLED: 'La recepción comercial de solicitudes aún no está habilitada.',
        INTERNAL_ERROR: 'Ocurrió un error en el servidor. Inténtalo nuevamente.',
        EMAIL_NOT_VERIFIED: 'Verifica tu correo antes de iniciar sesión.',
        VERIFICATION_INVALID: 'Este token de verificación no es válido, venció o ya se utilizó.',
        SESSION_INVALID: 'La sesión venció. Inicia sesión de nuevo.',
        REGISTRATION_UNAVAILABLE: 'El registro aún no está disponible. No se ha enviado ningún correo.',
        IDEMPOTENCY_KEY_CONFLICT: 'Esta clave ya se utilizó. Revisa tus solicitudes antes de enviar otra.',
        IDEMPOTENCY_PAYLOAD_CONFLICT: 'La clave ya se utilizó con otros datos. Revisa tus solicitudes.',
        DEPENDENCY_UNAVAILABLE: 'El servicio no está disponible. Inténtalo de nuevo.',
    };
    const message = error instanceof Error ? error.message : String(error);
    return <Alert type={"error"}>{error instanceof ApiError || error instanceof PlatformError ? t(message, translations[error.code] ?? message) : message}</Alert>;
}
export function EmptyState({ title, children, action }: { title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
    return <div className={"empty-state"}><span className={"empty-icon"}><Icon name={"calendar"} size={32}/></span>
    <h3>{title}</h3>
    {children && <p>{children}</p>}
    {action}</div>;
}
export function Loading({ label }: { label?: React.ReactNode }) {
    const { t } = useApp();
    return <div className={"loading"} role={"status"}><span className={"spinner"}/>
    {label ?? t('Loading your space…', 'Cargando tu espacio…')}</div>;
}
export const STATUS_LABELS: Record<string, [string, string]> = { DRAFT: ['Draft', 'Borrador'], REQUESTED: ['Request received', 'Solicitud recibida'], QUOTED: ['Quote available', 'Cotización disponible'], CONFIRMED: ['Confirmed', 'Confirmado'], COMPLETED: ['Completed', 'Completado'], CANCELLED: ['Closed / withdrawn', 'Cerrado / retirado'] };
export function Status({ status }: { status: string }) {
    const { t } = useApp();
    const labels: [string, string] = STATUS_LABELS[status] ?? [status, status];
    return <span className={`status status-${status.toLowerCase()}`}><span />
    {t(...labels)}</span>;
}
export function SectionHeading({ eyebrow, title, children, action }: { eyebrow?: React.ReactNode; title: React.ReactNode; children?: React.ReactNode; action?: React.ReactNode }) {
    return <div className={"section-heading"}><div>{eyebrow && <p className={"eyebrow"}>{eyebrow}</p>}
    <h2>{title}</h2>
    {children && <p className={"section-description"}>{children}</p>}</div>
    {action}</div>;
}
export function Reveal({ children, variant = 'up', delay = 0, className = '' }: { children: React.ReactNode; variant?: 'up' | 'left' | 'right'; delay?: number; className?: string }) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [armed, setArmed] = React.useState(false);
    const [visible, setVisible] = React.useState(true);
    React.useEffect(() => {
        const node = ref.current;
        if (!node)
            return;
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        let observer: IntersectionObserver | undefined;
        let initialFrame = 0;
        const show = () => { setVisible(true); setArmed(false); observer?.disconnect(); };
        if (media.matches || !('IntersectionObserver' in window))
            return;
        if (node.getBoundingClientRect().top > innerHeight) {
            initialFrame = requestAnimationFrame(() => { setArmed(true); setVisible(false); });
            observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer?.disconnect();
                }
            }, { threshold: .08, rootMargin: '0px 0px -4% 0px' });
            observer.observe(node);
        }
        media.addEventListener('change', show);
        return () => { cancelAnimationFrame(initialFrame); observer?.disconnect(); media.removeEventListener('change', show); };
    }, []);
    return <div ref={ref} className={`as-reveal ${className}`} data-armed={armed} data-visible={visible} data-variant={variant} style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}>{children}</div>;
}
export function ScrollStatement({ children }: { children: React.ReactNode }) {
    const anchor = React.useRef<HTMLDivElement>(null);
    const title = React.useRef<HTMLHeadingElement>(null);
    React.useEffect(() => {
        const media = matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0;
        const paint = () => {
            frame = 0;
            if (!anchor.current || !title.current)
                return;
            const rect = anchor.current.getBoundingClientRect();
            const progress = media.matches ? 0 : Math.max(0, Math.min(1, (innerHeight * .14 - rect.top) / Math.max(240, rect.height * .9)));
            title.current.style.transform = `translateY(${-progress * 26}px) scale(${1 - progress * .2})`;
            title.current.style.opacity = String(1 - progress);
        };
        const schedule = () => {
            if (!frame)
                frame = requestAnimationFrame(paint);
        };
        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        media.addEventListener('change', schedule);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); media.removeEventListener('change', schedule); };
    }, []);
    return <div ref={anchor} className={"statement-anchor"}><h2 ref={title} className={"scroll-statement"}>{children}</h2></div>;
}
export function Notice() {
    const { notice, dismissNotice, t } = useApp();
    React.useEffect(() => {
        if (!notice)
            return;
        const timer = setTimeout(dismissNotice, 7000);
        return () => clearTimeout(timer);
    }, [notice, dismissNotice]);
    return notice ? <div className={"toast"} role={"status"} key={notice.id}><span className={"toast-symbol"}><Icon name={"check"}/></span>
    <p>{notice.message}</p>
    <button onClick={dismissNotice} aria-label={t('Dismiss notification', 'Cerrar notificación')}><Icon name={"close"} size={16}/></button>
    <span className={"toast-timer"}/></div> : null;
}
