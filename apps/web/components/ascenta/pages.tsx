'use client';
import * as React from 'react';
import { Link, useApp } from './context';
import { Alert, Button, EmptyState, Field, Icon, Loading, Reveal } from './ui';
const services: { code?: 'AIRPORT_TRANSFER' | 'HOURLY' | 'CITY_TO_CITY' | 'ROUND_TRIP' | 'ONE_WAY'; icon: string; en: string; es: string; body: [string, string] }[] = [
    { code: 'AIRPORT_TRANSFER', icon: 'plane', en: 'Airport journeys', es: 'Viajes al aeropuerto', body: ['Share your flight context, pickup details and destination. The request keeps them together for review.', 'Comparte el contexto del vuelo, la recogida y el destino. La solicitud conserva todo junto para revisión.'] },
    { code: 'HOURLY', icon: 'clock', en: 'Time, on your terms', es: 'Tiempo a tu medida', body: ['Request a duration and an itinerary for a schedule with more than one stop. Availability and terms are reviewed separately.', 'Solicita una duración y un itinerario para una agenda con varias paradas. La disponibilidad y las condiciones se revisan por separado.'] },
    { code: 'CITY_TO_CITY', icon: 'pin', en: 'From one city to the next', es: 'De una ciudad a otra', body: ['Start with two addresses and your preferred time. Let the details define the journey.', 'Comienza con dos direcciones y la hora que prefieres. Los detalles definen el viaje.'] },
    { code: 'ROUND_TRIP', icon: 'refresh', en: 'There. And back.', es: 'De ida. Y de vuelta.', body: ['Keep outbound and return times in one request, in the pickup time zone.', 'Conserva las horas de ida y regreso en una sola solicitud, en la zona horaria de recogida.'] },
    { code: 'ONE_WAY', icon: 'car', en: 'A straightforward journey', es: 'Un viaje sencillo', body: ['A pickup, a destination and the details that matter to your passenger.', 'Una recogida, un destino y los detalles que le importan a tu pasajero.'] },
    { icon: 'building', en: 'Travel for your business', es: 'Viajes para tu empresa', body: ['Keep the person booking distinct from the person travelling. Begin a conversation about your organization’s needs.', 'Distingue a quien reserva de quien viaja. Comienza una conversación sobre las necesidades de tu organización.'] },
];
export function ServicesPage() {
    const { t, updateDraft, navigate } = useApp();
    return <section className={"inner-page container"} data-nav-theme={"light"}><div className={"page-heading"}><p className={"eyebrow"}>{t('A JOURNEY FOR EVERY OCCASION', 'UN VIAJE PARA CADA OCASIÓN')}</p>
    <h1>{t('Travel, thoughtfully arranged.', 'Viajes pensados con cuidado.')}</h1>
    <p>{t('Choose the context. Tell us the details. Begin with a clear request.', 'Elige el contexto. Comparte los detalles. Comienza con una solicitud clara.')}</p></div>
    <div className={"service-detail-grid"}>{services.map((s, i) => <Reveal key={s.en} delay={i % 2 * 80}><article className={"service-detail-card"}><span className={"service-number"}>{"0"}
        {i + 1}</span>
        <Icon name={s.icon} size={34}/>
        <h2>{t(s.en, s.es)}</h2>
        <p>{t(...s.body)}</p>
        <Button tone={"quiet"} onClick={() => {
                if (s.code) {
                    updateDraft({ serviceTypeCode: s.code });
                    navigate('/booking');
                }
                else
                    navigate('/business');
            }}>{t('Explore your next step', 'Conocer el siguiente paso')}
        <Icon name={"arrow"}/></Button></article></Reveal>)}</div>
    <p className={"illustration-note"}>{t('Service contexts are presented for review. Specific coverage, hours, policies and availability require operational approval before commercial launch.', 'Estos contextos de servicio se presentan para revisión. La cobertura, los horarios, las políticas y la disponibilidad requieren aprobación operativa antes del lanzamiento comercial.')}</p></section>;
}
export function FleetPage() {
    const { t, catalog, catalogError, refreshCatalog, updateDraft, navigate, runtime } = useApp();
    return <section className={"inner-page container"} data-nav-theme={"light"}><div className={"page-heading"}><p className={"eyebrow"}>{t('SPACE FOR YOUR JOURNEY', 'ESPACIO PARA TU VIAJE')}</p>
    <h1>{t('A considered choice.', 'Una elección bien pensada.')}</h1>
    <p>{t('Request the category that suits your party. An assigned vehicle is confirmed separately.', 'Solicita la categoría adecuada para tu grupo. El vehículo asignado se confirma por separado.')}</p></div>
        {catalogError ? <Alert type={"error"}>{t('Catalog unavailable.', 'Catálogo no disponible.')}
        <Button onClick={() => void refreshCatalog()}>{t('Retry', 'Reintentar')}</Button></Alert> : !catalog ? <Loading /> : <React.Fragment><div className={"vehicle-grid"}>{catalog.vehicleClasses.filter(v => v.isActive).map(v => <article className={"vehicle-card"} key={v.code}><div className={"vehicle-art"}><Icon name={v.code.includes('VAN') ? 'van' : 'car'} size={120}/></div>
            <div className="fleet-card-copy"><p className={"eyebrow"}>{t('REQUEST A CATEGORY', 'SOLICITAR CATEGORÍA')}</p>
            <h2>{v.name}</h2>
            <p className={"vehicle-capacity"}><Icon name={"users"}/>
            {v.passengerLimit}
            {" "}
            {t('passengers', 'pasajeros')}
            {" "}
            <Icon name={"bag"}/>
            {v.luggageLimit}</p>
            <p>{t('Your selection is a preference for review, not a guarantee of a specific vehicle.', 'Tu selección es una preferencia para revisión, no la garantía de un vehículo específico.')}</p>
            <Button tone={"secondary"} onClick={() => { updateDraft({ vehicleClassCode: v.code }); navigate('/booking'); }}>{t('Choose this category', 'Elegir categoría')}
            <Icon name={"arrow"}/></Button></div></article>)}</div>
        {runtime?.reviewMode && <Alert>{t('Demo catalog. Vehicle capacities are test values. Brand photography does not establish vehicle ownership or availability.', 'Catálogo de demostración. Las capacidades son valores de prueba. La fotografía de marca no acredita flota propia ni disponibilidad.')}</Alert>}</React.Fragment>}</section>;
}
export function BusinessPage() {
    const { t, user } = useApp();
    return <React.Fragment><section className={"business-hero inner-page"} data-nav-theme={"light"}><div className={"container contact-grid"}><div className={"contact-intro"}><p className={"eyebrow"}>{t('ASCENTA FOR BUSINESS', 'ASCENTA PARA EMPRESAS')}</p>
    <h1>{t('Your agenda.\nClearly connected.', 'Tu agenda.\nClaramente conectada.')}</h1>
    <p>{t('For the person travelling. For the person coordinating. A place for both, without confusing their roles.', 'Para quien viaja. Para quien coordina. Un lugar para ambos, sin confundir sus funciones.')}</p>
    <div className={"page-actions"}><Link href={"/contact?topic=Corporate%20travel"} className={"button button-primary"}>{t('Start a conversation', 'Comenzar conversación')}
    <Icon name={"arrow"}/></Link>
    <Link className={"button button-secondary"} href={user ? '/corporate' : '/login?next=%2Fcorporate'}>{t('Business account sign in', 'Acceder a cuenta empresarial')}</Link></div></div>
    <div className={"business-image"}><img src={"/brand/arrival-detail.webp"} alt={t('Executive journey illustration from the ASCENTA brand reference', 'Referencia ilustrativa de viaje ejecutivo de ASCENTA')} width={"600"} height={"610"}/>
    <span>{t('The details make the difference.', 'Los detalles hacen la diferencia.')}</span></div></div></section>
    <section className={"container section"}><div className={"service-detail-grid"}>{[[t('One booker. Another passenger.', 'Una persona reserva. Otra viaja.'), t('Passenger name and operational contact remain separate from the account holder.', 'El nombre y contacto operativo del pasajero permanecen separados de quien tiene la cuenta.'), 'users'], [t('The right visibility.', 'La visibilidad adecuada.'), t('Organizational permissions are enforced on the server, not only hidden in a menu.', 'Los permisos de organización se verifican en el servidor, no solo se ocultan en un menú.'), 'shield'], [t('An actual request history.', 'Un historial real de solicitudes.'), t('See authorized requests and export the filtered selection. No invented spend or utilization figures.', 'Consulta solicitudes autorizadas y exporta la selección filtrada. Sin cifras inventadas de gasto o uso.'), 'calendar'], [t('A deliberate next step.', 'Un siguiente paso deliberado.'), t('Corporate onboarding, service coverage and commercial terms require a separate agreement and setup.', 'La incorporación empresarial, la cobertura y las condiciones comerciales requieren un acuerdo y configuración separados.'), 'building']].map(([title, body, icon]) => <article className={"service-detail-card"} key={title}><Icon name={icon} size={32}/>
        <h2>{title}</h2>
        <p>{body}</p></article>)}</div></section></React.Fragment>;
}
export function ContactPage() {
    const { t } = useApp();
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [topic, setTopic] = React.useState('');
    const [message, setMessage] = React.useState('');
    React.useEffect(() => {
        const frame = requestAnimationFrame(() => {
            setTopic(new URLSearchParams(window.location.search).get('topic') ?? '');
        });
        return () => cancelAnimationFrame(frame);
    }, []);
    return <section className={"inner-page container"} data-nav-theme={"light"}><div className={"contact-grid"}><div className={"contact-intro"}><p className={"eyebrow"}>{t('LET’S CONNECT', 'CONVERSEMOS')}</p>
    <h1>{t('Good journeys begin\nwith a conversation.', 'Los buenos viajes empiezan\ncon una conversación.')}</h1>
    <p>{t('Share what you are planning. Keep sensitive identification and payment information out of your message.', 'Comparte lo que estás planeando. No incluyas identificación sensible ni información de pago en tu mensaje.')}</p>
    <Link href={"/booking"} className={"text-link"}>{t('Already have a journey in mind?', '¿Ya tienes un viaje en mente?')}
    <Icon name={"arrow"}/></Link>
    <p className={"illustration-note"}>{t('A support phone, external email channel and response-time commitment are not published until approved by ASCENTA.', 'No se publica teléfono de soporte, correo externo ni compromiso de tiempo de respuesta hasta que ASCENTA los apruebe.')}</p></div>
    <form className={"form-panel form-stack"} onSubmit={event => event.preventDefault()}><h2>{t('Tell us a little more.', 'Cuéntanos un poco más.')}</h2>
        <Alert>{t('Contact inquiries are not available yet. This form does not send or save messages. You can use the journey request form to plan a trip.', 'Las consultas de contacto aún no están disponibles. Este formulario no envía ni guarda mensajes. Puedes usar el formulario de solicitud para planificar un viaje.')}</Alert>
        <Field id={"contact-name"} label={t('Name', 'Nombre')}><input id={"contact-name"} required={true} minLength={2} maxLength={160} autoComplete={"name"} value={name} onChange={e => setName(e.target.value)}/></Field>
        <Field id={"contact-email"} label={t('Email', 'Correo electrónico')}><input id={"contact-email"} type={"email"} required={true} maxLength={254} autoComplete={"email"} value={email} onChange={e => setEmail(e.target.value)}/></Field>
        <Field id={"contact-topic"} label={t('Subject', 'Asunto')}><input id={"contact-topic"} required={true} minLength={2} maxLength={120} value={topic} onChange={e => setTopic(e.target.value)}/></Field>
        <Field id={"contact-message"} label={t('Message', 'Mensaje')}><textarea id={"contact-message"} required={true} minLength={10} maxLength={3000} rows={5} value={message} onChange={e => setMessage(e.target.value)}/></Field>
        <Button type={"submit"} disabled={true}>{t('Send inquiry', 'Enviar consulta')}
        <Icon name={"arrow"}/></Button>
        <small>{t('Read the', 'Consulta el')}
        {" "}
        <Link href={"/privacy"}>{t('privacy notice', 'aviso de privacidad')}</Link>
        {"."}</small></form></div></section>;
}
export function HelpPage() {
    const { t } = useApp();
    const items = [
        [t('Is sending a request the same as booking a car?', '¿Enviar una solicitud equivale a reservar un vehículo?'), t('No. A request saves the journey details for review. Price, availability and operational confirmation must be agreed separately. This application does not collect payments.', 'No. La solicitud guarda los detalles del viaje para revisión. El precio, la disponibilidad y la confirmación operativa deben acordarse por separado. Esta aplicación no cobra pagos.')],
        [t('Can I book for someone else?', '¿Puedo reservar para otra persona?'), t('Yes. Passenger name, phone and optional email are separate fields. The signed-in account remains the request creator.', 'Sí. El nombre, teléfono y correo opcional del pasajero se capturan por separado. La cuenta que inicia sesión permanece como creadora de la solicitud.')],
        [t('What happens to my draft when I sign in?', '¿Qué sucede con el borrador al iniciar sesión?'), t('The draft stays in this browser tab for up to 30 minutes from its creation. It is restored after sign-in and removed after a successful submission, sign-out or expiration.', 'El borrador permanece en esta pestaña hasta 30 minutos desde su creación. Se recupera al iniciar sesión y se elimina tras enviarse correctamente, cerrar sesión o vencer.')],
        [t('Which time zone applies?', '¿Qué zona horaria se utiliza?'), t('The explicitly selected pickup time zone. The default is America/New_York. Nonexistent daylight-saving times are rejected; repeated clock times require selecting the first or second occurrence.', 'La zona horaria de recogida seleccionada explícitamente. Por defecto, America/New_York. Las horas inexistentes por cambio de horario se rechazan; las repetidas requieren seleccionar la primera o segunda.')],
        [t('Can I change or withdraw a request?', '¿Puedo cambiar o retirar una solicitud?'), t('You can review your submitted requests in your account. Online changes and cancellations are not available yet. A request does not establish a cancellation fee or refund policy.', 'Puedes consultar las solicitudes enviadas desde tu cuenta. Los cambios y cancelaciones en línea aún no están disponibles. Una solicitud no establece una política de cargos de cancelación o reembolsos.')],
        [t('Can I recover my password here?', '¿Puedo recuperar mi contraseña aquí?'), t('Password recovery is not available in this version. The application does not send a recovery message or create a replacement password.', 'La recuperación de contraseña no está disponible en esta versión. La aplicación no envía mensajes de recuperación ni crea una contraseña de reemplazo.')],
    ];
    return <section className={"inner-page container paper-page"} data-nav-theme={"light"}><div className={"page-heading"}><p className={"eyebrow"}>{t('A LITTLE GUIDANCE', 'UN POCO DE ORIENTACIÓN')}</p>
    <h1>{t('Clarity, before you go.', 'Claridad antes de partir.')}</h1>
    <p>{t('Straightforward answers about this journey experience.', 'Respuestas claras sobre esta experiencia de viaje.')}</p></div>
    <div className={"faq-list"}>{items.map(([question, answer]) => <details key={question}><summary>{question}
        <Icon name={"chevron"} size={18}/></summary>
        <p>{answer}</p></details>)}</div>
    <div className={"page-actions"}><Link className={"button button-primary"} href={"/contact"}>{t('Ask another question', 'Hacer otra pregunta')}
    <Icon name={"arrow"}/></Link></div></section>;
}
export function PolicyPage({ privacy }: { privacy: boolean }) {
    const { t } = useApp();
    const content = privacy ? [
        [t('Purpose and scope', 'Propósito y alcance'), t('This notice describes the supplied development build, not an approved commercial privacy policy. Use invented test information until ASCENTA approves production hosting, retention rules, support channels and operational providers.', 'Este aviso describe la versión de desarrollo entregada, no una política comercial de privacidad aprobada. Usa datos de prueba hasta que ASCENTA apruebe alojamiento, retención, canales de soporte y proveedores operativos.')],
        [t('What is stored', 'Qué se almacena'), t('Accounts contain a name, email and password hash. Submitted requests contain route, time zone, schedule, category and passenger contact information. The contact form does not send or store inquiries. No payment card field exists.', 'Las cuentas guardan nombre, correo y un hash de la contraseña. Las solicitudes enviadas guardan ruta, zona horaria, fecha, categoría y contacto del pasajero. El formulario de contacto no envía ni almacena consultas. No hay campos para tarjetas de pago.')],
        [t('Browser storage', 'Almacenamiento en el navegador'), t('Essential session and CSRF cookies support access. The language preference is stored locally. A journey draft is stored in this tab for up to 30 minutes, then removed. There are no analytics, advertising scripts or marketing subscriptions in this review build.', 'Las cookies esenciales de sesión y CSRF permiten el acceso. La preferencia de idioma se guarda localmente. El borrador de viaje se guarda en esta pestaña hasta 30 minutos y luego se elimina. Esta revisión no incorpora analíticas, publicidad ni suscripciones de marketing.')],
        [t('Demo data', 'Datos de demostración'), t('When the demo indicator is visible, accounts and requests are temporary test data and are lost when the demo server restarts. Use fictional information in that environment. Outside demo mode, submitted information is stored by the application server.', 'Cuando aparece el indicador de demostración, las cuentas y solicitudes son datos de prueba temporales que se pierden al reiniciar el servidor de demostración. Usa información ficticia en ese entorno. Fuera de ese modo, el servidor de la aplicación almacena la información enviada.')],
        [t('Access and publication', 'Acceso y publicación'), t('Customer and organizational authorization is checked on the server. Public deployment is not authorized by this notice. A production review must address data retention, lawful notices, provider contracts, internal multifactor authentication and deletion/access requests before real customer intake.', 'La autorización personal y organizacional se verifica en el servidor. Este aviso no autoriza publicar. Antes de recibir clientes reales se requiere revisar retención, avisos aplicables, contratos, autenticación multifactor interna y solicitudes de acceso o eliminación.')]
    ] : [
        [t('A request is not a confirmation', 'Una solicitud no es una confirmación'), t('Submitting stores a request with the status Request received. It does not guarantee price, coverage, vehicle availability or a chauffeur. Only a distinct operational confirmation changes the journey to Confirmed.', 'Enviar guarda una solicitud con el estado Solicitud recibida. No garantiza precio, cobertura, disponibilidad ni conductor. Solo una confirmación operativa separada cambia el viaje a Confirmado.')],
        [t('Quotations and payments', 'Cotizaciones y pagos'), t('Requests begin a review process. Quotation acceptance, online payment and operational confirmation are not available in this version. A submitted request does not constitute a commercial offer or an agreed price.', 'Las solicitudes inician un proceso de revisión. Esta versión no permite aceptar cotizaciones, pagar en línea ni confirmar operativamente el viaje. Enviar una solicitud no constituye una oferta comercial ni un precio acordado.')],
        [t('Fleet and service information', 'Información de flota y servicios'), t('Brand photography is illustrative. Prototype category capacities remain test values until operations approves them. Coverage, minimum durations, wait time, luggage policies, cancellation fees and commercial availability are not established by this development build.', 'La fotografía de marca es ilustrativa. Las capacidades del prototipo siguen siendo valores de prueba hasta su aprobación. Esta versión no establece cobertura, duración mínima, espera, políticas de equipaje, cargos de cancelación ni disponibilidad comercial.')],
        [t('Withdrawal and operational changes', 'Retiro y cambios operativos'), t('Submitted requests can be reviewed in the account area. Online changes and cancellations are not available in this version. This notice does not establish a refund or cancellation-fee policy.', 'Las solicitudes enviadas pueden consultarse desde la cuenta. Esta versión no permite cambios ni cancelaciones en línea. Este aviso no establece una política de reembolso o cargos de cancelación.')],
        [t('Before launch', 'Antes del lanzamiento'), t('This is a development request notice, not final legal terms. ASCENTA must approve real commercial terms, support channels, fleet, operations and production security before publication.', 'Este es un aviso de solicitudes en desarrollo, no términos legales definitivos. ASCENTA debe aprobar condiciones comerciales, soporte, flota, operación y seguridad antes de publicar.')]
    ];
    return <section className={"inner-page container paper-page"} data-nav-theme={"light"}><div className={"page-heading"}><p className={"eyebrow"}>{t('DEVELOPMENT NOTICE', 'AVISO DE DESARROLLO')}</p>
    <h1>{privacy ? t('Privacy, explained.', 'Privacidad, explicada.') : t('A clear request.', 'Una solicitud clara.')}</h1>
    <p>{t('For the review build. Commercial publication remains pending approval.', 'Para la versión de revisión. La publicación comercial requiere aprobación.')}</p></div>
    <div className={"content-prose"}>{content.map(([title, body]) => <section key={title}><h2>{title}</h2>
        <p>{body}</p></section>)}</div>
    <Link className={"button button-secondary"} href={"/booking"}>{t('Back to your journey', 'Volver a tu viaje')}
    <Icon name={"arrow"}/></Link></section>;
}
export function NotFoundPage() {
    const { t } = useApp();
    return <section className={"inner-page container"}><EmptyState title={t('Let’s get you back on your way.', 'Volvamos al camino.')} action={<Link className={"button button-primary"} href={"/"}>{t('Return to ASCENTA', 'Volver a ASCENTA')}
        <Icon name={"arrow"}/></Link>}>{t('This page does not exist. Your request details, if still within the draft period, remain in this tab.', 'Esta página no existe. Si el borrador aún está vigente, tus datos permanecen en esta pestaña.')}</EmptyState></section>;
}
