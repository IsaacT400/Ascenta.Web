
import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { safeReturn } from './platform';
import { api, Link, useApp } from './context';
import { Alert, Brand, Button, ErrorMessage, Field, Icon } from './ui';

const modes = ['login', 'register', 'forgot', 'reset', 'verify'] as const;
type AuthMode = typeof modes[number];
const isAuthMode = (value: string | null): value is AuthMode => modes.some(mode => mode === value);

export function AuthPage() {
    const { t, refreshUser, navigate, notify } = useApp();
    const location = useLocation();
    const routeNavigate = useNavigate();
    const [mode, setMode] = React.useState<AuthMode>('login');
    const [next, setNext] = React.useState('/dashboard');
    const [token, setToken] = React.useState('');
    const [localToken, setLocalToken] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [name, setName] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [accepted, setAccepted] = React.useState(false);
    const [show, setShow] = React.useState(false);
    const [error, setError] = React.useState<unknown>(null);
    const [message, setMessage] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [verified, setVerified] = React.useState(false);

    React.useEffect(() => {
        const query = new URLSearchParams(location.search);
        const target = query.get('mode');
        let returnTo = query.get('next');
        try { returnTo ||= window.sessionStorage.getItem('ascenta.auth.return'); }
        catch { /* A blocked browser store must not prevent signing in. */ }
        const safe = safeReturn(returnTo ?? '/dashboard');
        try { window.sessionStorage.setItem('ascenta.auth.return', safe); }
        catch { /* The return address is retained in component state. */ }
        const secret = new URLSearchParams(location.hash.slice(1)).get('token') ?? query.get('token') ?? '';
        // React Router owns URL changes, including back/forward and same-page links.
        let active = true;
        queueMicrotask(() => {
            if (!active) return;
            setMode(isAuthMode(target) ? target : secret ? 'verify' : 'login');
            setNext(safe);
            if (secret) {
                setToken(secret);
                query.delete('token');
                if (!isAuthMode(target)) query.set('mode', 'verify');
                const search = query.toString();
                void routeNavigate({ pathname: location.pathname, search: search ? `?${search}` : '', hash: '' }, { replace: true });
            }
        });
        return () => { active = false; };
    }, [location.pathname, location.search, location.hash, routeNavigate]);

    function changeMode(value: AuthMode) {
        setMode(value); setError(null); setMessage(''); setPassword(''); setShow(false); setVerified(false);
        if (value !== 'verify') { setToken(''); setLocalToken(''); }
        void routeNavigate(`/login?${new URLSearchParams({ mode: value, next })}`, { replace: true });
    }

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy || mode === 'forgot' || mode === 'reset') return;
        setBusy(true); setError(null); setMessage('');
        try {
            if (mode === 'login') {
                await api('/auth/login', { email: email.trim(), password });
                setPassword('');
                if (!await refreshUser()) throw new Error(t('Your account could not be checked. Please try signing in again.', 'No pudimos verificar tu cuenta. Intenta iniciar sesión de nuevo.'));
                try { window.localStorage.setItem('ascenta.auth-event', String(Date.now())); }
                catch { /* Session cookies remain authoritative when storage is blocked. */ }
                notify(t('Welcome back. Your journey continues.', 'Bienvenido. Tu viaje continúa.'));
                navigate(next);
            } else if (mode === 'register') {
                if (!accepted) throw new Error(t('Please accept the account and request notices.', 'Acepta los avisos de cuenta y solicitud.'));
                const result = await api('/auth/register', { email: email.trim(), displayName: name.trim(), password, termsAccepted: true });
                setPassword('');
                setLocalToken(result.localVerificationToken ?? '');
                setMessage(t('Your registration request was processed. Email verification is required before signing in. If you already have an account, return to sign in.', 'Tu solicitud de registro fue procesada. Debes verificar tu correo antes de iniciar sesión. Si ya tienes cuenta, vuelve al acceso.'));
            } else if (mode === 'verify') {
                await api('/auth/verify-email', { token: token.trim() });
                setToken(''); setLocalToken(''); setVerified(true);
                setMessage(t('Your email is verified. Sign in to continue your journey.', 'Tu correo está verificado. Inicia sesión para continuar tu viaje.'));
            }
        } catch (err) { setError(err); }
        finally { setBusy(false); }
    }

    const unsupported = mode === 'forgot' || mode === 'reset';
    const title: Record<AuthMode, string> = {
        login: t('Welcome back.', 'Bienvenido.'), register: t('Your journey starts here.', 'Tu viaje empieza aquí.'),
        forgot: t('A fresh start.', 'Un nuevo comienzo.'), reset: t('Account recovery.', 'Recuperación de cuenta.'),
        verify: t('One last detail.', 'Un último detalle.'),
    };
    return <section className="auth-page" data-nav-theme="light"><div className="auth-layout">
        <div className="auth-story"><img src="/brand/journey-hero.webp" alt="" />
            <div><Brand full /><p className="eyebrow">{t('A LITTLE MORE CERTAINTY', 'UN POCO MÁS DE CERTEZA')}</p>
                <h2>{t('A personal space.\nA considered journey.', 'Un espacio personal.\nUn viaje bien pensado.')}</h2>
                <p>{t('Your requests, their details and their status. Clearly connected.', 'Tus solicitudes, sus detalles y sus estados. Claramente conectados.')}</p>
                <span>EXECUTIVE TRANSPORTATION</span>
            </div>
        </div>
        <div className="auth-card">
            <Link className="auth-back" href={next === '/booking' ? '/booking' : '/'}><Icon name="arrow-left" size={16} />
                {next === '/booking' ? t('Back to your journey', 'Volver a tu viaje') : t('Back to Ascenta', 'Volver a Ascenta')}
            </Link>
            <p className="eyebrow">ASCENTA ACCOUNT</p><h1>{title[mode]}</h1>
            <p>{mode === 'login' ? t('Sign in to pick up where you left off.', 'Inicia sesión y continúa donde lo dejaste.') : mode === 'register' ? t('Just the essentials. Your trip details come later.', 'Solo lo necesario. Los datos del viaje vienen después.') : mode === 'verify' ? t('Confirm that this email belongs to you.', 'Confirma que este correo te pertenece.') : t('Keep your account secure and your journey connected.', 'Mantén tu cuenta segura y tu viaje conectado.')}</p>
            {(mode === 'login' || mode === 'register') && <div className="auth-tabs">
                <button type="button" disabled={busy} aria-pressed={mode === 'login'} onClick={() => changeMode('login')}>{t('Sign in', 'Iniciar sesión')}</button>
                <button type="button" disabled={busy} aria-pressed={mode === 'register'} onClick={() => changeMode('register')}>{t('Create account', 'Crear cuenta')}</button>
            </div>}
            <ErrorMessage error={error} />
            {message && <Alert type="success">{message}</Alert>}
            {mode === 'register' && localToken && <Alert>
                {t('Local development verification: no email was sent. The server provided a one-time token for this account.', 'Verificación de desarrollo local: no se envió un correo. El servidor proporcionó un token de un solo uso para esta cuenta.')}{' '}
                <Button tone="quiet" onClick={() => { setToken(localToken); changeMode('verify'); }}>{t('Continue to local verification', 'Continuar a la verificación local')}</Button>
            </Alert>}
            {unsupported ? <Alert>{t('Password recovery is not available in this version. No reset request has been sent. Contact your account administrator if you cannot sign in.', 'La recuperación de contraseña no está disponible en esta versión. No se ha enviado ninguna solicitud de recuperación. Contacta al administrador de tu cuenta si no puedes acceder.')}</Alert> : !(mode === 'verify' && verified) && <form onSubmit={submit} className="form-stack">
                <fieldset disabled={busy} className="form-stack">
                    {mode === 'register' && <Field label={t('Full name', 'Nombre completo')} id="account-name"><input id="account-name" autoComplete="name" required minLength={2} maxLength={160} value={name} onChange={e => setName(e.target.value)} /></Field>}
                    {(mode === 'login' || mode === 'register') && <Field label={t('Email address', 'Correo electrónico')} id="account-email"><input id="account-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} /></Field>}
                    {(mode === 'login' || mode === 'register') && <Field label={t('Password', 'Contraseña')} id="account-password" hint={mode === 'login' ? undefined : t('At least 12 characters. A unique passphrase works well.', 'Al menos 12 caracteres. Una frase única es una buena opción.')}>
                        <div className="password-wrap"><input id="account-password" type={show ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'login' ? 8 : 12} maxLength={128} value={password} onChange={e => setPassword(e.target.value)} />
                            <button type="button" onClick={() => setShow(!show)} aria-label={show ? t('Hide password', 'Ocultar contraseña') : t('Show password', 'Mostrar contraseña')} aria-pressed={show}><Icon name="eye" size={19} /></button>
                        </div>
                    </Field>}
                    {mode === 'verify' && <Field label={t('Verification token', 'Token de verificación')} id="account-token" hint={t('Use the token from your verification link or local registration.', 'Usa el token de tu enlace de verificación o del registro local.')}><input id="account-token" autoComplete="off" spellCheck={false} required minLength={32} maxLength={256} value={token} onChange={e => setToken(e.target.value)} /></Field>}
                    {mode === 'login' && <div className="form-inline">
                        <button type="button" className="text-button" onClick={() => changeMode('forgot')}>{t('Forgot password?', '¿Olvidaste tu contraseña?')}</button>
                        <button type="button" className="text-button" onClick={() => changeMode('verify')}>{t('Verify email', 'Verificar correo')}</button>
                    </div>}
                    {mode === 'register' && <label className="check-field"><input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} required />
                        <span>{t('I have read the account and request notices. This does not subscribe me to marketing.', 'He leído los avisos de cuenta y solicitud. Esto no me suscribe a publicidad.')}{' '}<Link href="/privacy">{t('Privacy', 'Privacidad')}</Link>{' · '}<Link href="/terms">{t('Request notice', 'Aviso de solicitud')}</Link></span>
                    </label>}
                    <Button type="submit" busy={busy} disabled={mode === 'verify' && !token.trim()}>{mode === 'login' ? t('Sign in', 'Iniciar sesión') : mode === 'register' ? t('Create my account', 'Crear mi cuenta') : t('Verify my email', 'Verificar mi correo')}<Icon name="arrow" /></Button>
                </fieldset>
            </form>}
            {(mode !== 'login' || message) && <div className="auth-footnote"><button type="button" disabled={busy} className="text-button" onClick={() => changeMode('login')}>{t('Return to sign in', 'Volver a iniciar sesión')}</button></div>}
            <p className="auth-footnote"><Icon name="shield" size={17} />{t('Your account is separate from the passenger’s contact details.', 'Tu cuenta está separada de los datos de contacto del pasajero.')}</p>
        </div>
    </div></section>;
}
