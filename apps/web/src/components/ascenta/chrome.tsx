import * as React from 'react';
import { Link, useApp } from './context';
import { Brand, Icon } from './ui';
export function Header() {
    const { t, path, user, lang, setLang } = useApp();
    const [theme, setTheme] = React.useState(path === '/' ? 'dark' : 'light');
    const [raised, setRaised] = React.useState(false);
    const menu = React.useRef<HTMLDialogElement>(null);
    const menuButton = React.useRef<HTMLButtonElement>(null);
    const header = React.useRef<HTMLElement>(null);
    const [open, setOpen] = React.useState(false);
    React.useEffect(() => {
        let frame = 0;
        const paint = () => {
            frame = 0;
            const height = header.current?.getBoundingClientRect().height ?? 88;
            const element = document.elementFromPoint(Math.round(innerWidth * .55), Math.round(height + 4));
            setTheme(element?.closest<HTMLElement>('[data-nav-theme]')?.dataset.navTheme ?? 'light');
            setRaised(scrollY > 24);
        };
        const schedule = () => {
            if (!frame)
                frame = requestAnimationFrame(paint);
        };
        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);
        return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); };
    }, [path]);
    React.useEffect(() => {
        const before = document.body.style.overflow;
        if (open)
            document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = before; };
    }, [open]);
    const close = () => { menu.current?.close(); setOpen(false); };
    const links = [[t('Our services', 'Servicios'), '/services'], [t('Fleet', 'Flota'), '/fleet'], [t('Our approach', 'Nuestra esencia'), '/#experience'], [t('For business', 'Empresas'), '/business'], [t('Contact', 'Contacto'), '/contact'], [t('Help', 'Ayuda'), '/help']];
    return <React.Fragment><a className={"skip-link"} href={"#main-content"} onClick={e => { e.preventDefault(); document.getElementById('main-content')?.focus(); }}>{t('Skip to content', 'Saltar al contenido')}</a>
    <header className={"site-header"} data-theme={theme} data-raised={raised} ref={header}><div className={"nav-shell"}><Link href={"/"} className={"brand-surface"} aria-label={t('ASCENTA home', 'Inicio ASCENTA')}><Brand variant={theme === 'dark' ? 'light' : 'dark'} /></Link>
    <nav className={"desktop-nav"} aria-label={t('Main navigation', 'Navegación principal')}>{links.map(([name, href]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{name}</Link>)}</nav>
    <div className={"nav-actions"}><button className={"language-button"} onClick={() => setLang(lang === 'en' ? 'es' : 'en')} aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}><Icon name={"globe"} size={16}/>
    <span>{lang.toUpperCase()}</span></button>
    <Link className={"sign-in-link"} href={user ? '/dashboard' : '/login'}><Icon name={"user"} size={17}/>
    <span>{user ? t('My account', 'Mi cuenta') : t('Sign in', 'Acceder')}</span></Link>
    <Link className={"button button-primary nav-book"} href={"/booking"}>{t('Plan a journey', 'Planificar viaje')}
    <Icon name={"arrow"} size={17}/></Link>
    <button className={"mobile-menu-button"} ref={menuButton} onClick={() => { menu.current?.showModal(); setOpen(true); }} aria-label={t('Open navigation', 'Abrir navegación')} aria-expanded={open} aria-controls={"mobile-navigation"}><Icon name={"menu"}/></button></div></div></header>
    <dialog id={"mobile-navigation"} className={"mobile-dialog"} aria-label={t('Main navigation', 'Navegación principal')} ref={menu} onClose={() => { setOpen(false); menuButton.current?.focus(); }}><div className={"mobile-dialog-top"}><Link href={"/"} className={"brand-surface"} onClick={close}><Brand /></Link>
    <button className={"icon-button"} onClick={close} aria-label={t('Close navigation', 'Cerrar navegación')}><Icon name={"close"}/></button></div>
    <nav aria-label={t('Mobile navigation', 'Navegación móvil')}>{links.map(([name, href]) => <Link key={href} href={href} onClick={close}>{name}
        <Icon name={"arrow"}/></Link>)}
    <Link href={user ? '/dashboard' : '/login'} onClick={close}>{user ? t('My account', 'Mi cuenta') : t('Sign in / create account', 'Acceder / crear cuenta')}
    <Icon name={"user"}/></Link></nav>
    <Link href={"/booking"} onClick={close} className={"button button-primary"}>{t('Plan a journey', 'Planificar viaje')}
    <Icon name={"arrow"}/></Link></dialog></React.Fragment>;
}
export function Footer() {
    const { t } = useApp();
    return <footer className={"site-footer"} data-nav-theme={"dark"}><div className={"container footer-invitation"}><div><p className={"eyebrow"}>{"ASCENTA EXECUTIVE TRANSPORTATION"}</p>
    <h2>{t('Your next journey,', 'Tu próximo viaje,')}
    <br />
    <em>{t('thoughtfully considered.', 'pensado con cuidado.')}</em></h2></div>
    <Link className={"button button-light"} href={"/booking"}>{t('Start your request', 'Comenzar solicitud')}
    <Icon name={"arrow"}/></Link></div>
    <div className={"container footer-grid"}><div><Link href={"/"} className={"brand-surface footer-brand"}><Brand variant="light" /></Link>
    <p className={"footer-tagline"}>{"Certainty from reservation to arrival."}</p>
    <p className={"footer-note"}>{t('A clear beginning. A considered journey.', 'Un comienzo claro. Un viaje bien pensado.')}</p></div>
    <div><h3>{t('Explore', 'Explorar')}</h3>
    <Link href={"/services"}>{t('Our services', 'Servicios')}</Link>
    <Link href={"/fleet"}>{t('Vehicle preferences', 'Vehículos')}</Link>
    <Link href={"/business"}>{t('Business travel', 'Viajes corporativos')}</Link></div>
    <div><h3>{t('Your journey', 'Tu viaje')}</h3>
    <Link href={"/booking"}>{t('Plan a journey', 'Planificar viaje')}</Link>
    <Link href={"/dashboard"}>{t('My account', 'Mi cuenta')}</Link>
    <Link href={"/help"}>{t('Help & questions', 'Ayuda y preguntas')}</Link></div>
    <div><h3>{t('Let’s connect', 'Conversemos')}</h3>
    <Link href={"/contact"}>{t('Contact ASCENTA', 'Contactar ASCENTA')}
    <Icon name={"arrow"} size={16}/></Link>
    <Link href={"/business"}>{t('Corporate inquiries', 'Consultas empresariales')}</Link></div></div>
    <div className={"container footer-bottom"}><span>{"\u00A9 "}
    {new Date().getFullYear()}
    {" ASCENTA. "}
    {t('Executive Transportation.', 'Executive Transportation.')}</span>
    <div><Link href={"/privacy"}>{t('Privacy notice', 'Aviso de privacidad')}</Link>
    <Link href={"/terms"}>{t('Request notice', 'Aviso de solicitud')}</Link></div></div></footer>;
}
export function ReviewIndicator() {
    const { t, runtime } = useApp();
    if (!runtime?.reviewMode) return null;
    return <div className="review-indicator" role="status">
        <span className="review-dot" />
        <span>{t('Demo environment · test requests', 'Entorno de demostración · solicitudes de prueba')}</span>
    </div>;
}
