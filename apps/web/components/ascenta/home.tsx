'use client';
import * as React from 'react';
import { possibleInstants } from './platform';
import { Link, useApp } from './context';
import { Button, ErrorMessage, Icon, Reveal, ScrollStatement, SectionHeading } from './ui';
export function JourneyStarter() {
    const { t, draft, updateDraft, navigate, ready } = useApp();
    const [error, setError] = React.useState<Error | null>(null);
    const hourly = draft.serviceTypeCode === 'HOURLY';
    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const instants = possibleInstants(`${draft.date}T${draft.time}`, draft.zone);
        if (!instants.length || instants.every(instant => Date.parse(instant) <= Date.now())) {
            setError(new Error(t('Choose a valid future pickup date and time.', 'Elige una fecha y hora de recogida válidas y futuras.')));
            return;
        }
        navigate('/booking');
    };
    return <div className={"journey-starter"}><div className={"journey-modes"} role={"group"} aria-label={t('Journey mode', 'Modalidad del viaje')}><button type={"button"} aria-pressed={!hourly} onClick={() => updateDraft({ serviceTypeCode: 'ONE_WAY' })} disabled={draft.submissionUncertain}>{t('One way', 'Solo ida')}</button>
    <button type={"button"} aria-pressed={hourly} onClick={() => updateDraft({ serviceTypeCode: 'HOURLY' })} disabled={draft.submissionUncertain}>{t('By the hour', 'Por horas')}</button></div>
    <form className={"starter-form"} onSubmit={submit}><div className={"starter-field"}><Icon name={"pin"}/>
    <label htmlFor={"home-pickup"}>{t('Pickup location', 'Punto de recogida')}</label>
    <input id={"home-pickup"} value={draft.pickupAddress} onChange={e => updateDraft({ pickupAddress: e.target.value })} placeholder={t('Address, airport, hotel', 'Dirección, aeropuerto, hotel')} autoComplete={"off"} required={true} minLength={3} maxLength={300} disabled={draft.submissionUncertain}/></div>
        {hourly ? <div className={"starter-field"}><Icon name={"clock"}/>
        <label htmlFor={"home-hours"}>{t('Requested duration', 'Duración solicitada')}</label>
        <select id={"home-hours"} value={draft.hours} onChange={e => updateDraft({ hours: +e.target.value })} disabled={draft.submissionUncertain}>{[1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 24].map(h => <option value={h} key={h}>{h}
            {" "}
            {t('hours', 'horas')}</option>)}</select></div> : <div className={"starter-field"}><Icon name={"pin"}/>
        <label htmlFor={"home-destination"}>{t('Drop-off location', 'Punto de destino')}</label>
        <input id={"home-destination"} value={draft.destinationAddress} onChange={e => updateDraft({ destinationAddress: e.target.value })} placeholder={t('Where are you going?', '¿Hacia dónde viajas?')} autoComplete={"off"} required={true} minLength={3} maxLength={300} disabled={draft.submissionUncertain}/></div>}
    <div className={"starter-field starter-date"}><Icon name={"calendar"}/>
    <label htmlFor={"home-date"}>{t('Pickup date', 'Fecha de recogida')}</label>
    <input type={"date"} id={"home-date"} value={draft.date} onChange={e => updateDraft({ date: e.target.value, occurrence: undefined })} required={true} disabled={draft.submissionUncertain}/></div>
    <div className={"starter-field starter-time"}><Icon name={"clock"}/>
    <label htmlFor={"home-time"}>{t('Pickup time', 'Hora de recogida')}</label>
    <input type={"time"} id={"home-time"} value={draft.time} onChange={e => updateDraft({ time: e.target.value, occurrence: undefined })} required={true} disabled={draft.submissionUncertain}/></div>
    <Button type={"submit"} disabled={!ready} className={"starter-submit"}>{draft.submissionUncertain ? t('Resume request', 'Retomar solicitud') : t('Plan my journey', 'Planificar viaje')}
    <Icon name={"arrow"} size={18}/></Button></form>
        {error ? <ErrorMessage error={error}/> : <p className={"starter-note"}><Icon name={"shield"} size={14}/>
        {t('A request, not an instant confirmation. Availability and pricing are reviewed first.', 'Es una solicitud, no una confirmación inmediata. La disponibilidad y el precio se revisan primero.')}</p>}</div>;
}
export function Home() {
    const { t, updateDraft, catalog, runtime } = useApp();
    const services = [
        { icon: 'plane', title: t('Airport journeys', 'Viajes al aeropuerto'), copy: t('Start with your flight and pickup details. Keep the next step clear.', 'Comienza con los datos de tu vuelo y recogida. Mantén claro el siguiente paso.'), mode: 'AIRPORT_TRANSFER' as const },
        { icon: 'clock', title: t('By the hour', 'Por horas'), copy: t('Share your schedule and the time you need. Shape the request around your day.', 'Comparte tu agenda y el tiempo que necesitas. Diseña la solicitud alrededor de tu día.'), mode: 'HOURLY' as const },
        { icon: 'building', title: t('Business travel', 'Viajes de negocios'), copy: t('For the traveler, the assistant and everyone coordinating behind the scenes.', 'Para el viajero, el asistente y quienes coordinan cada detalle.'), mode: 'ONE_WAY' as const },
    ];
    return <React.Fragment><section className={"hero"} data-nav-theme={"dark"}><img className={"hero-photo"} src={"/brand/journey-hero.webp"} alt={""} width={"1098"} height={"758"} fetchPriority={"high"}/>
    <div className={"hero-shade"}/>
    <div className={"container hero-content"}><p className={"eyebrow hero-eyebrow"}>{"EXECUTIVE TRANSPORTATION. "}
    {t('THOUGHTFULLY CONSIDERED.', 'CON CUIDADO EN CADA DETALLE.')}</p>
    <h1>{t('Certainty from', 'Certeza desde la reserva')}
    <br />
    <em>{t('reservation to arrival.', 'hasta la llegada.')}</em></h1>
    <p className={"hero-subtitle"}>{t('Your time matters. Begin a journey with clarity, care and a personal sense of direction.', 'Tu tiempo importa. Comienza un viaje con claridad, cuidado y atención personal.')}</p></div>
    <div className={"container hero-booking"}><JourneyStarter /></div>
    <div className={"hero-bottom container"}><span>{t('EVERY DETAIL STARTS WITH YOU', 'CADA DETALLE COMIENZA CONTIGO')}</span>
    <Link href={"/#experience"} className={"discover-link"}>{t('Discover ASCENTA', 'Descubre ASCENTA')}
    <span>{"\u2193"}</span></Link></div></section>
    <section className={"experience-section"} id={"experience"} data-nav-theme={"light"}><div className={"container"}><p className={"eyebrow centered"}>{t('THE ASCENTA APPROACH', 'LA ESENCIA DE ASCENTA')}</p>
    <ScrollStatement>{t('Elevating', 'Elevando')}
    <br />
    <em>{t('every journey.', 'cada viaje.')}</em></ScrollStatement>
    <p className={"experience-intro"}>{t('Less uncertainty. More room for what matters.', 'Menos incertidumbre. Más espacio para lo importante.')}</p>
    <div className={"editorial-pair"}><Reveal variant={"left"} className={"editorial-image"}><img src={"/brand/arrival-detail.webp"} width={"600"} height={"610"} loading={"lazy"} alt={t('Detail of the traveler and aircraft in the approved ASCENTA brand image.', 'Detalle del viajero y avión en la imagen de marca aprobada de ASCENTA.')}/>
    <div className={"image-caption"}><span>{"01"}</span>
    {t('A considered beginning.', 'Un comienzo bien pensado.')}</div></Reveal>
    <Reveal variant={"right"} delay={110} className={"editorial-image editorial-image-offset"}><img src={"/brand/vehicle-detail.webp"} width={"498"} height={"656"} loading={"lazy"} alt={t('Vehicle detail in the ASCENTA brand reference, not a verified fleet photograph.', 'Detalle del vehículo en la referencia de marca; no es una foto de flota verificada.')}/>
    <div className={"image-caption"}><span>{"02"}</span>
    {t('Care in the details.', 'Cuidado en los detalles.')}</div></Reveal></div>
    {runtime?.reviewMode && <p className={"image-disclosure"}>{t('Approved brand imagery. Vehicle ownership, access and commercial service coverage are not represented as verified.', 'Imágenes de referencia de marca. No acreditan flota propia, permisos ni cobertura comercial.')}</p>}</div></section>
    <section className={"section services-section"} data-nav-theme={"light"}><div className={"container"}><SectionHeading eyebrow={t('MADE AROUND YOUR DAY', 'ALREDEDOR DE TU DÍA')} title={<React.Fragment>{t('A journey for', 'Un viaje para')}
        <br />
        <em>{t('every purpose.', 'cada propósito.')}</em></React.Fragment>} action={<Link className={"text-link"} href={"/services"}>{t('Explore our services', 'Explorar servicios')}
        <Icon name={"arrow"}/></Link>}/>
    <div className={"service-grid"}>{services.map((item, i) => <Reveal key={item.title} delay={i * 80}><article className={"service-card"}><span className={"service-icon"}><Icon name={item.icon} size={30}/></span>
        <h3>{item.title}</h3>
        <p>{item.copy}</p>
        <Link className={"circle-link"} href={i === 2 ? '/business' : '/booking'} onClick={() => {
                if (i !== 2)
                    updateDraft({ serviceTypeCode: item.mode });
            }} aria-label={`${t('Explore', 'Explorar')} ${item.title}`}><Icon name={"arrow"}/></Link></article></Reveal>)}</div></div></section>
    <section className={"care-section"} data-nav-theme={"dark"}><div className={"container care-grid"}><Reveal variant={"left"} className={"care-picture"}><img src={"/brand/journey-hero.webp"} width={"1098"} height={"758"} loading={"lazy"} alt={""}/>
    <span className={"care-picture-label"}>{"ASCENTA / "}
    {t('A CONSIDERED JOURNEY', 'UN VIAJE BIEN PENSADO')}</span></Reveal>
    <Reveal variant={"right"} className={"care-copy"}><p className={"eyebrow"}>{t('CLARITY IS PART OF THE EXPERIENCE', 'LA CLARIDAD ES PARTE DE LA EXPERIENCIA')}</p>
    <h2>{t('Confidence in', 'Confianza en')}
    <br />
    <em>{t('the next step.', 'el siguiente paso.')}</em></h2>
    <p>{t('A good journey begins before the vehicle arrives. Your request, the person traveling and the next decision deserve the same attention.', 'Un buen viaje comienza antes de que llegue el vehículo. Tu solicitud, quien viaja y la próxima decisión merecen la misma atención.')}</p>
    <div className={"care-point"}><Icon name={"calendar"}/>
    <div><h3>{t('Your plans stay together', 'Tus planes, en un solo lugar')}</h3>
    <p>{t('Carry your details from the first form into your journey request.', 'Conserva los datos desde el primer formulario hasta tu solicitud.')}</p></div></div>
    <div className={"care-point"}><Icon name={"users"}/>
    <div><h3>{t('The right person, the right details', 'La persona y los datos correctos')}</h3>
    <p>{t('Booker and passenger are distinct, so the contact details stay clear.', 'Quien reserva y quien viaja se distinguen para mantener claro el contacto.')}</p></div></div>
    <div className={"care-point"}><Icon name={"shield"}/>
    <div><h3>{t('A status you can understand', 'Un estado que puedes entender')}</h3>
    <p>{t('A request remains a request until it is actually confirmed.', 'Una solicitud sigue siendo una solicitud hasta que se confirme realmente.')}</p></div></div></Reveal></div></section>
    <section className={"section vehicle-section"} data-nav-theme={"light"}><div className={"container"}><SectionHeading eyebrow={t('YOUR JOURNEY, YOUR PREFERENCE', 'TU VIAJE, TU PREFERENCIA')} title={<React.Fragment>{t('The space', 'El espacio')}
        {" "}
        <em>{t('to arrive well.', 'para llegar bien.')}</em></React.Fragment>} action={<Link href={"/fleet"} className={"text-link"}>{t('View vehicle preferences', 'Ver preferencias de vehículo')}
        <Icon name={"arrow"}/></Link>}>{t('Choose a preferred category. Availability, final vehicle and capacity are confirmed during review.', 'Elige una categoría preferida. La disponibilidad, el vehículo y su capacidad se confirman durante la revisión.')}</SectionHeading>
        {catalog ? <div className={"vehicle-grid"}>{catalog.vehicleClasses.filter(v => v.isActive).map((vehicle, i) => <Reveal key={vehicle.code} delay={i * 70}><Link href={"/booking"} className={"vehicle-card"} onClick={() => updateDraft({ vehicleClassCode: vehicle.code })}><div className={"vehicle-visual"}><Icon name={vehicle.code.includes('VAN') ? 'van' : 'car'} size={90}/>
            <span>{String(i + 1).padStart(2, '0')}</span></div>
            <div className={"vehicle-card-copy"}><div><p className={"eyebrow"}>{t('PREFERRED CATEGORY', 'CATEGORÍA PREFERIDA')}</p>
            <h3>{vehicle.name}</h3></div>
            <Icon name={"arrow"}/></div></Link></Reveal>)}</div> : <Link href={"/fleet"} className={"button button-secondary"}>{t('Open available categories', 'Abrir categorías disponibles')}
        <Icon name={"arrow"}/></Link>}</div></section>
    <section className={"business-section"} data-nav-theme={"light"}><div className={"container business-grid"}><Reveal variant={"left"}><p className={"eyebrow"}>{t('FOR THE PEOPLE BEHIND THE PLANS', 'PARA QUIENES COORDINAN CADA PLAN')}</p>
    <h2>{t('You handle the day.', 'Tú coordinas el día.')}
    <br />
    <em>{t('Keep the journey clear.', 'Mantén claro el viaje.')}</em></h2>
    <p>{t('Travel coordination should not be another uncertainty. Start a corporate conversation, separate the booker from the traveler and keep requests connected to the right account.', 'La coordinación del transporte no debería ser otra incertidumbre. Inicia una conversación empresarial, distingue a quien reserva de quien viaja y vincula las solicitudes con la cuenta correcta.')}</p>
    <Link href={"/business"} className={"button button-primary"}>{t('Explore business travel', 'Explorar viajes de negocios')}
    <Icon name={"arrow"}/></Link></Reveal>
    <Reveal variant={"right"} className={"account-illustration"}><div className={"illustration-top"}><span className={"mini-brand"}>{"ASCENTA"}</span>
    <span>{t('Your journey, in focus', 'Tu viaje, con claridad')}</span></div>
    <div className={"illustration-content"}><span className={"illustration-icon"}><Icon name={"user"} size={25}/></span>
    <p className={"eyebrow"}>{t('ACCOUNT EXPERIENCE', 'EXPERIENCIA DE CUENTA')}</p>
    <h3>{t('A clear place to begin.', 'Un lugar claro para comenzar.')}</h3>
    <div className={"illustration-row"}><Icon name={"pin"}/>
    <div><strong>{t('Journey details', 'Datos del viaje')}</strong>
    <small>{t('Your pickup, destination and time', 'Recogida, destino y hora')}</small></div>
    <Icon name={"check"}/></div>
    <div className={"illustration-row"}><Icon name={"users"}/>
    <div><strong>{t('Passenger & booker', 'Pasajero y solicitante')}</strong>
    <small>{t('Different people. Clear contact.', 'Personas distintas. Contacto claro.')}</small></div>
    <Icon name={"check"}/></div>
    <div className={"illustration-row"}><Icon name={"shield"}/>
    <div><strong>{t('Request status', 'Estado de solicitud')}</strong>
    <small>{t('Received → reviewed → confirmed', 'Recibida → revisada → confirmada')}</small></div>
    <Icon name={"check"}/></div></div>
    <p className={"illustration-footnote"}>{t('Process overview. No sample reservations or invented account metrics.', 'Resumen del proceso. Sin reservas ficticias ni métricas inventadas.')}</p></Reveal></div></section></React.Fragment>;
}
