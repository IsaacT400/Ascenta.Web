'use client';
import * as React from 'react';
import * as platform_1 from './platform';
import * as context_js_1 from './context';
import * as ui_js_1 from './ui';
import { mapJourneyToReservation } from './adapter-api';
import type { JourneyDraft, JourneyInput, Reservation, Language } from './types';
export const SERVICE_NAMES: Readonly<Record<string, readonly [string, string]>> = { ONE_WAY: ['One way', 'Solo ida'], AIRPORT_TRANSFER: ['Airport transfer', 'Traslado al aeropuerto'], HOURLY: ['By the hour', 'Por horas'], ROUND_TRIP: ['Round trip', 'Ida y vuelta'], CITY_TO_CITY: ['City to city', 'Entre ciudades'] };
export function formatDate(value: string, zone: string, lang: Language = 'en') {
    try {
        return new Intl.DateTimeFormat(lang === 'es' ? 'es-US' : 'en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: zone }).format(new Date(value));
    }
    catch {
        return value;
    }
}
export function payloadFromDraft(d: JourneyDraft, acknowledgedRequest: boolean): JourneyInput {
    return platform_1.normalizeJourney({ serviceTypeCode: d.serviceTypeCode, vehicleClassCode: d.vehicleClassCode, pickupAddress: d.pickupAddress, destinationAddress: d.destinationAddress,
        scheduledAt: platform_1.toInstant(`${d.date}T${d.time}`, d.zone, d.occurrence), scheduledTimeZone: d.zone, passengerCount: Number(d.passengers), luggageCount: Number(d.luggage),
        ...(d.serviceTypeCode === 'HOURLY' ? { durationMinutes: Number(d.hours) * 60 } : {}),
        ...(d.serviceTypeCode === 'ROUND_TRIP' ? { returnAt: platform_1.toInstant(`${d.returnDate}T${d.returnTime}`, d.zone, d.returnOccurrence) } : {}),
        ...(d.serviceTypeCode === 'AIRPORT_TRANSFER' ? { flightNumber: d.flightNumber, flightDirection: d.flightDirection } : {}),
        passengerName: d.passengerName, passengerEmail: d.passengerEmail || undefined, passengerPhone: d.passengerPhone, notes: d.notes || undefined, organizationId: d.organizationId || undefined, idempotencyKey: d.key, acknowledgedRequest });
}
function AmbiguousTime({ local, zone, value, onChange, id }: { local: string; zone: string; value?: 0 | 1; onChange: (value: 0 | 1 | undefined) => void; id: string }) {
    const { t } = context_js_1.useApp();
    let options: string[] = [];
    try {
        options = platform_1.possibleInstants(local, zone);
    }
    catch { }
    if (options.length < 2)
        return null;
    return <ui_js_1.Field label={t('This clock time occurs twice. Which one?', 'Esta hora ocurre dos veces. ¿Cuál prefieres?')} id={id}><select id={id} required={true} value={value ?? ''} onChange={e => onChange(e.target.value === '0' ? 0 : e.target.value === '1' ? 1 : undefined)}><option value={""}>{t('Choose an occurrence', 'Selecciona una')}</option>
        {options.map((date, i) => <option value={i} key={date}>{i === 0 ? t('First occurrence', 'Primera vez') : t('Second occurrence', 'Segunda vez')}
        {" \u00B7 UTC"}
        {date.slice(-6)}</option>)}</select></ui_js_1.Field>;
}
export function BookingPage() {
    const { t, draft: d, updateDraft: update, clearDraft, catalog, catalogError, refreshCatalog, user, authLoading, authError, refreshUser, runtime, ready, storageWarning, navigate } = context_js_1.useApp();
    const [progress, setProgress] = React.useState({ draftKey: '', step: 0 });
    const step = d.submissionUncertain ? 3 : progress.draftKey === d.key ? progress.step : 0;
    const [error, setError] = React.useState<unknown>(null);
    const [busy, setBusy] = React.useState(false);
    const [acknowledgedKey, setAcknowledgedKey] = React.useState<string | null>(null);
    const ack = !!d.key && acknowledgedKey === d.key;
    const [success, setSuccess] = React.useState<Reservation | null>(null);
    const fields = error instanceof context_js_1.ApiError || error instanceof platform_1.PlatformError ? error.fields : undefined;
    const chosen = catalog?.vehicleClasses.find(v => v.code === d.vehicleClassCode);
    const steps = [t('Journey', 'Viaje'), t('Vehicle', 'Vehículo'), t('Passenger', 'Pasajero'), t('Review', 'Revisión')];
    const go = (next: number) => { setProgress({ draftKey: d.key, step: next }); setError(null); requestAnimationFrame(() => { document.querySelector<HTMLFormElement>('.form-panel')?.focus({ preventScroll: true }); document.querySelector('.booking-heading')?.scrollIntoView({ block: 'start' }); }); };
    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (busy) return;
        setError(null);
        try {
            if (step === 0) {
                const first = platform_1.toInstant(`${d.date}T${d.time}`, d.zone, d.occurrence);
                if (new Date(first).getTime() <= Date.now())
                    throw new Error(t('Choose a future pickup time.', 'Selecciona una recogida en el futuro.'));
                if (d.serviceTypeCode === 'ROUND_TRIP' && Date.parse(platform_1.toInstant(`${d.returnDate}T${d.returnTime}`, d.zone, d.returnOccurrence)) <= Date.parse(first))
                    throw new Error(t('The return must be after the outbound journey.', 'El regreso debe ser después de la ida.'));
                go(1);
                return;
            }
            if (step === 1) {
                if (!chosen?.isActive)
                    throw new Error(t('Select a vehicle category.', 'Selecciona una categoría.'));
                if (d.passengers > chosen.passengerLimit || d.luggage > chosen.luggageLimit)
                    throw new Error(t('Choose a category that accommodates your party and luggage.', 'Elige una categoría con capacidad para tus pasajeros y equipaje.'));
                go(2);
                return;
            }
            if (step === 2) {
                if (!catalog)
                    throw new Error(t('The catalog is unavailable.', 'El catálogo no está disponible.'));
                const input = platform_1.validateJourney(payloadFromDraft(d, true), catalog);
                mapJourneyToReservation(input);
                go(3);
                return;
            }
            if (authLoading || authError)
                throw new Error(t('Refresh your session before sending the request.', 'Verifica tu sesión antes de enviar la solicitud.'));
            if (!user) {
                navigate(context_js_1.loginDestination('/booking'));
                return;
            }
            if (!user.emailVerified)
                throw new context_js_1.ApiError('EMAIL_UNVERIFIED', 'Verify your email before submitting the request.', 403);
            if (!ack && !d.submissionUncertain)
                throw new Error(t('Acknowledge that this is a request, not a confirmed booking.', 'Acepta que se trata de una solicitud, no una reserva confirmada.'));
            const input = payloadFromDraft(d, true);
            // Once a response may have been lost, keep exactly the same key and payload for retries.
            if (!d.submissionUncertain && catalog)
                platform_1.validateJourney(input, catalog);
            setBusy(true);
            const row = await context_js_1.api('/requests', input);
            setSuccess(row);
            clearDraft();
        }
        catch (err) {
            setError(err);
            if (step === 3 && err instanceof context_js_1.ApiError && (err.status === 0 || err.status >= 500 || err.code === 'RESPONSE_INVALID'))
                update({ submissionUncertain: true });
        }
        finally {
            setBusy(false);
        }
    }
    if (!ready)
        return <div className={"inner-page container"}><ui_js_1.Loading /></div>;
    if (success)
        return <section className={"inner-page container booking-success"} data-nav-theme={"light"}><div className={"success-symbol"}><ui_js_1.Icon name={"check"} size={40}/></div>
        <p className={"eyebrow"}>{t('A clear next step', 'El siguiente paso, claro')}</p>
        <h1>{t('Your request is received.', 'Recibimos tu solicitud.')}</h1>
        <p>{t('Your journey details are saved. This is not a confirmed or paid booking. A quotation and an operational confirmation are separate steps.', 'Los datos de tu viaje están guardados. Esto no es una reserva confirmada ni pagada. La cotización y la confirmación operativa son pasos separados.')}</p>
        <div className={"success-reference"}><small>{t('Request reference', 'Referencia de solicitud')}</small>
        <strong>{success.reference}</strong>
        <ui_js_1.Status status={success.status}/></div>
        {runtime?.reviewMode && <ui_js_1.Alert>{t('Local review: this request is stored only in the running review environment. No real chauffeur has been dispatched.', 'Revisión local: esta solicitud solo se almacena en el entorno de revisión. No se ha enviado ningún conductor real.')}</ui_js_1.Alert>}
        <div className={"success-actions"}><context_js_1.Link className={"button button-primary"} href={"/dashboard"}>{t('View my journeys', 'Ver mis viajes')}
        <ui_js_1.Icon name={"arrow"}/></context_js_1.Link>
        <ui_js_1.Button tone={"secondary"} onClick={() => { setSuccess(null); go(0); setAcknowledgedKey(null); }}>{t('Plan another journey', 'Planear otro viaje')}</ui_js_1.Button></div></section>;
    return <section className={"booking-page container"} data-nav-theme={"light"}><div className={"booking-heading"}><p className={"eyebrow"}>{t('YOUR JOURNEY, CONSIDERED', 'TU VIAJE, BIEN PENSADO')}</p>
    <h1>{t('Let’s plan your journey.', 'Planeemos tu viaje.')}</h1>
    <p>{t('A few details now. A clear next step from here.', 'Algunos detalles ahora. Un próximo paso claro.')}</p></div>
    <ol className={"progress-steps"} aria-label={t('Request progress', 'Progreso de solicitud')}>{steps.map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={step === index ? 'is-current' : step > index ? 'is-complete' : ''}><span className={"step-circle"}>{step > index ? <ui_js_1.Icon name={"check"} size={16}/> : index + 1}</span>
        <span>{label}</span></li>)}</ol>
    <div className={"flow-layout"}><form className={"form-panel"} tabIndex={-1} onSubmit={submit}><div className={"panel-intro"}><p className={"eyebrow"}>{"0"}
    {step + 1}
    {" / 04"}</p>
    <h2>{[t('The details of your journey', 'Los detalles de tu viaje'), t('Room for your journey', 'Espacio para tu viaje'), t('Who is travelling?', '¿Quién viaja?'), t('Everything in one place', 'Todo en un solo lugar')][step]}</h2>
    <p>{[t('Times below are local to the pickup time zone.', 'Las horas corresponden a la zona de recogida.'), t('Request a category. Availability is checked separately.', 'Solicita una categoría. La disponibilidad se verifica por separado.'), t('The person booking and the passenger can be different.', 'Quien reserva y quien viaja pueden ser personas distintas.'), t('Check each detail before sending your request.', 'Verifica cada detalle antes de enviar la solicitud.')][step]}</p></div>
    <ui_js_1.ErrorMessage error={error}/>
    {storageWarning && <ui_js_1.Alert>{t('Browser storage is unavailable. Keep this tab open to preserve your draft.', 'El almacenamiento del navegador no está disponible. Mantén esta pestaña abierta.')}</ui_js_1.Alert>}
        {d.submissionUncertain && <ui_js_1.Alert>{t('The server response was interrupted. Your details are locked so a retry cannot create a different journey with the same key. Retry below, or check My journeys before starting over.', 'La respuesta del servidor se interrumpió. Los datos están bloqueados para que el reintento conserve exactamente la misma solicitud. Reintenta abajo o revisa Mis viajes antes de empezar otra.')}
        {" "}
        <context_js_1.Link href={"/dashboard"}>{t('My journeys', 'Mis viajes')}</context_js_1.Link>
        <ui_js_1.Button tone={"secondary"} disabled={busy} onClick={() => { clearDraft(); setProgress({ draftKey: '', step: 0 }); setAcknowledgedKey(null); setError(null); }}>{t('Start a new request', 'Empezar una nueva solicitud')}</ui_js_1.Button></ui_js_1.Alert>}
    <fieldset disabled={busy || d.submissionUncertain} className={"form-stack"}>{step === 0 && <React.Fragment><div className={"field-grid"}><ui_js_1.Field id={"trip-mode"} label={t('Service', 'Servicio')}><select id={"trip-mode"} value={d.serviceTypeCode} onChange={e => update({ serviceTypeCode: e.target.value })}>{(catalog?.serviceTypes ?? [{ code: 'ONE_WAY' }]).filter(v => !('isActive' in v) || v.isActive).map(s => <option key={s.code} value={s.code}>{t(...SERVICE_NAMES[s.code])}</option>)}</select></ui_js_1.Field>
        <ui_js_1.Field id={"trip-zone"} label={t('Pickup time zone', 'Zona horaria de recogida')}><select id={"trip-zone"} value={d.zone} onChange={e => update({ zone: e.target.value, occurrence: undefined, returnOccurrence: undefined })}><option value={"America/New_York"}>{"Eastern \u00B7 America/New_York"}</option>
        <option value={"America/Chicago"}>{"Central \u00B7 America/Chicago"}</option>
        <option value={"America/Denver"}>{"Mountain \u00B7 America/Denver"}</option>
        <option value={"America/Los_Angeles"}>{"Pacific \u00B7 America/Los_Angeles"}</option></select></ui_js_1.Field></div>
        <ui_js_1.Field id={"trip-pickup"} label={t('Pickup address', 'Dirección de recogida')} error={fields?.pickupAddress}><input id={"trip-pickup"} autoComplete={"off"} required={true} minLength={3} maxLength={300} value={d.pickupAddress} onChange={e => update({ pickupAddress: e.target.value })} placeholder={t('Airport, hotel or full address', 'Aeropuerto, hotel o dirección completa')}/></ui_js_1.Field>
        <ui_js_1.Field id={"trip-destination"} label={d.serviceTypeCode === 'HOURLY' ? t('Itinerary / last stop', 'Itinerario / última parada') : t('Destination address', 'Dirección de destino')} error={fields?.destinationAddress}><input id={"trip-destination"} required={true} minLength={3} maxLength={300} value={d.destinationAddress} onChange={e => update({ destinationAddress: e.target.value })} placeholder={t('Enter the destination or planned itinerary', 'Indica el destino o itinerario previsto')}/></ui_js_1.Field>
        <div className={"field-grid"}><ui_js_1.Field id={"trip-date"} label={t('Pickup date', 'Fecha de recogida')}><input id={"trip-date"} type={"date"} required={true} value={d.date} onChange={e => update({ date: e.target.value, occurrence: undefined })}/></ui_js_1.Field>
        <ui_js_1.Field id={"trip-time"} label={t('Pickup time', 'Hora de recogida')}><input id={"trip-time"} type={"time"} required={true} value={d.time} onChange={e => update({ time: e.target.value, occurrence: undefined })}/></ui_js_1.Field></div>
        <AmbiguousTime id={"trip-occurrence"} local={`${d.date}T${d.time}`} zone={d.zone} value={d.occurrence} onChange={occurrence => update({ occurrence })}/>
        {d.serviceTypeCode === 'HOURLY' && <ui_js_1.Field id={"trip-hours"} label={t('Requested duration', 'Duración solicitada')} hint={t('This is a requested duration, not a confirmed rate or commercial minimum.', 'Es una duración solicitada, no una tarifa ni un mínimo comercial confirmado.')}><input id={"trip-hours"} type={"number"} min={"1"} max={"24"} step={"0.5"} required={true} value={d.hours} onChange={e => update({ hours: Number(e.target.value) })}/></ui_js_1.Field>}
            {d.serviceTypeCode === 'ROUND_TRIP' && <React.Fragment><div className={"field-grid"}><ui_js_1.Field id={"trip-return-date"} label={t('Return date', 'Fecha de regreso')}><input id={"trip-return-date"} type={"date"} required={true} value={d.returnDate} onChange={e => update({ returnDate: e.target.value, returnOccurrence: undefined })}/></ui_js_1.Field>
            <ui_js_1.Field id={"trip-return-time"} label={t('Return pickup time', 'Hora de recogida del regreso')}><input id={"trip-return-time"} type={"time"} required={true} value={d.returnTime} onChange={e => update({ returnTime: e.target.value, returnOccurrence: undefined })}/></ui_js_1.Field></div>
            <AmbiguousTime id={"return-occurrence"} local={`${d.returnDate}T${d.returnTime}`} zone={d.zone} value={d.returnOccurrence} onChange={returnOccurrence => update({ returnOccurrence })}/></React.Fragment>}
            {d.serviceTypeCode === 'AIRPORT_TRANSFER' && <div className={"field-grid"}><ui_js_1.Field id={"trip-flight-direction"} label={t('Flight context', 'Tipo de vuelo')}><select id={"trip-flight-direction"} value={d.flightDirection} onChange={e => update({ flightDirection: e.target.value })}><option value={"ARRIVAL"}>{t('Arriving flight', 'Vuelo de llegada')}</option>
            <option value={"DEPARTURE"}>{t('Departing flight', 'Vuelo de salida')}</option></select></ui_js_1.Field>
            <ui_js_1.Field id={"trip-flight"} label={t('Flight number (optional)', 'Número de vuelo (opcional)')}><input id={"trip-flight"} maxLength={24} value={d.flightNumber} onChange={e => update({ flightNumber: e.target.value })} placeholder={"AA 123"}/></ui_js_1.Field></div>}
        <div className={"field-grid"}><ui_js_1.Field id={"trip-passengers"} label={t('Passengers', 'Pasajeros')}><input id={"trip-passengers"} required={true} type={"number"} min={"1"} max={"50"} value={d.passengers} onChange={e => update({ passengers: Number(e.target.value) })}/></ui_js_1.Field>
        <ui_js_1.Field id={"trip-luggage"} label={t('Luggage pieces', 'Piezas de equipaje')}><input id={"trip-luggage"} required={true} type={"number"} min={"0"} max={"50"} value={d.luggage} onChange={e => update({ luggage: Number(e.target.value) })}/></ui_js_1.Field></div></React.Fragment>}
        {step === 1 && <React.Fragment>{catalogError ? <ui_js_1.Alert type={"error"}>{t('The catalog could not be loaded.', 'No se pudo cargar el catálogo.')}
            {" "}
            <ui_js_1.Button tone={"quiet"} onClick={() => void refreshCatalog()}>{t('Retry', 'Reintentar')}</ui_js_1.Button></ui_js_1.Alert> : !catalog ? <ui_js_1.Loading /> : <div className={"category-options"} role={"radiogroup"} aria-label={t('Vehicle category', 'Categoría de vehículo')}>{catalog.vehicleClasses.filter(v => v.isActive).map(v => {
                    const unavailable = d.passengers > v.passengerLimit || d.luggage > v.luggageLimit;
                    return <label key={v.code} className={`category-option ${d.vehicleClassCode === v.code ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`}><input type={"radio"} name={"vehicle-class"} value={v.code} checked={d.vehicleClassCode === v.code} disabled={unavailable} onChange={() => update({ vehicleClassCode: v.code })}/>
                    <span className={"category-icon"}><ui_js_1.Icon name={v.code.includes('VAN') ? 'van' : 'car'} size={54}/></span>
                    <span className={"category-copy"}><strong>{v.name}</strong>
                    <span><ui_js_1.Icon name={"users"} size={16}/>
                    {" "}
                    {v.passengerLimit}
                    {" "}
                    <ui_js_1.Icon name={"bag"} size={16}/>
                    {" "}
                    {v.luggageLimit}</span>
                    <small>{unavailable ? t('Not enough capacity for this request', 'Capacidad insuficiente para esta solicitud') : t('Subject to an operational availability check', 'Sujeto a verificación operativa')}</small></span>
                    <span className={"selection-dot"}>{d.vehicleClassCode === v.code && <ui_js_1.Icon name={"check"} size={14}/>}</span></label>;
                })}</div>}
        {runtime?.reviewMode && <ui_js_1.Alert>{t('Demo catalog: category capacities are test values, not a verified statement of ASCENTA’s fleet.', 'Catálogo de demostración: las capacidades son valores de prueba, no una declaración verificada de la flota de ASCENTA.')}</ui_js_1.Alert>}</React.Fragment>}
        {step === 2 && <React.Fragment>{user && <ui_js_1.Button tone={"secondary"} onClick={() => update({ passengerName: user.displayName, passengerEmail: user.email })}><ui_js_1.Icon name={"user"} size={16}/>
            {t('I am the passenger', 'Yo soy el pasajero')}</ui_js_1.Button>}
        <ui_js_1.Field id={"passenger-name"} label={t('Passenger’s full name', 'Nombre completo del pasajero')} error={fields?.passengerName}><input id={"passenger-name"} autoComplete={"name"} required={true} minLength={2} maxLength={160} value={d.passengerName} onChange={e => update({ passengerName: e.target.value })}/></ui_js_1.Field>
        <div className={"field-grid"}><ui_js_1.Field id={"passenger-phone"} label={t('Passenger phone', 'Teléfono del pasajero')} hint={t('Include + and the country code. Example: +16175550123.', 'Incluye + y el código de país. Ejemplo: +16175550123.')} error={fields?.passengerPhone}><input id={"passenger-phone"} type={"tel"} autoComplete={"tel"} required={true} pattern={"\\+[1-9][0-9]{7,14}"} maxLength={16} value={d.passengerPhone} onChange={e => update({ passengerPhone: e.target.value })} placeholder={"+1"}/></ui_js_1.Field>
        <ui_js_1.Field id={"passenger-email"} label={t('Passenger email (optional)', 'Correo del pasajero (opcional)')}><input id={"passenger-email"} type={"email"} autoComplete={"email"} maxLength={254} value={d.passengerEmail} onChange={e => update({ passengerEmail: e.target.value })}/></ui_js_1.Field></div>
            {!!user?.organizations.length && <ui_js_1.Field id={"booking-organization"} label={t('Book for', 'Reservar para')}><select id={"booking-organization"} value={d.organizationId} onChange={e => update({ organizationId: e.target.value })}><option value={""}>{t('My personal account', 'Mi cuenta personal')}</option>
            {user.organizations.map(o => <option value={o.id} key={o.id}>{o.name}</option>)}</select></ui_js_1.Field>}
        <ui_js_1.Field id={"trip-notes"} label={t('Anything we should know? (optional)', '¿Qué debemos saber? (opcional)')} error={fields?.notes} hint={t('No payment card numbers, passwords or sensitive identification.', 'No incluyas números de tarjeta, contraseñas ni identificación sensible.')}><textarea id={"trip-notes"} rows={4} maxLength={1600} value={d.notes} onChange={e => update({ notes: e.target.value })}/></ui_js_1.Field></React.Fragment>}</fieldset>
        {step === 3 && <React.Fragment><div className={"review-grid"}>{[[t('Journey', 'Viaje'), t(...SERVICE_NAMES[d.serviceTypeCode])], [t('Pickup', 'Recogida'), `${d.pickupAddress} · ${d.date} ${d.time} (${d.zone})`], [t('Destination', 'Destino'), d.destinationAddress], [t('Vehicle / party', 'Vehículo / grupo'), `${chosen?.name ?? d.vehicleClassCode} · ${d.passengers} ${t('passengers', 'pasajeros')} · ${d.luggage} ${t('bags', 'maletas')}`], ...(d.serviceTypeCode === 'HOURLY' ? [[t('Duration', 'Duración'), `${d.hours} h`]] : []), ...(d.serviceTypeCode === 'ROUND_TRIP' ? [[t('Return', 'Regreso'), `${d.returnDate} ${d.returnTime}`]] : []), ...(d.serviceTypeCode === 'AIRPORT_TRANSFER' ? [[t('Flight', 'Vuelo'), `${d.flightDirection} ${d.flightNumber}`]] : []), [t('Passenger', 'Pasajero'), `${d.passengerName} · ${d.passengerPhone}${d.passengerEmail ? ` · ${d.passengerEmail}` : ''}`], [t('Notes', 'Notas'), d.notes || '—']].map(([label, value]) => <div key={label} className={"review-item"}><small>{label}</small>
            <strong>{value}</strong></div>)}</div>
        <label className={"check-field"}><input type={"checkbox"} checked={ack || d.submissionUncertain} disabled={busy || d.submissionUncertain} onChange={e => setAcknowledgedKey(e.target.checked ? d.key : null)}/>
        <span>{t('I understand that this is a journey request. Price, availability and confirmation are not yet guaranteed.', 'Entiendo que esto es una solicitud de viaje. El precio, la disponibilidad y la confirmación aún no están garantizados.')}
        {" "}
        <context_js_1.Link href={"/terms"}>{t('Request notice', 'Aviso de solicitud')}</context_js_1.Link></span></label>
            {authLoading ? <ui_js_1.Loading /> : authError ? <ui_js_1.Alert type={"error"}>{t('We could not check your session.', 'No pudimos verificar tu sesión.')}
            {" "}
            <ui_js_1.Button tone={"quiet"} onClick={() => void refreshUser()}>{t('Retry', 'Reintentar')}</ui_js_1.Button></ui_js_1.Alert> : !user ? <ui_js_1.Alert>{t('Sign in or create an account to send your request. Your journey draft will be kept while you continue.', 'Inicia sesión o crea una cuenta para enviar tu solicitud. Conservaremos el borrador de tu viaje mientras continúas.')}
            {" "}
            <context_js_1.Link href={context_js_1.loginDestination('/booking', 'register')}>{t('Create account', 'Crear cuenta')}</context_js_1.Link></ui_js_1.Alert> : !user.emailVerified ? <ui_js_1.Alert>{t('Verify your email before sending.', 'Verifica tu correo antes de enviar.')}
            {" "}
            <context_js_1.Link href={context_js_1.loginDestination('/booking', 'verify')}>{t('Verify my email', 'Verificar mi correo')}</context_js_1.Link></ui_js_1.Alert> : <p className={"expiry-note"}><ui_js_1.Icon name={"shield"} size={16}/>
            {t('Booking account', 'Cuenta que reserva')}
            {": "}
            {user.email}</p>}
        {runtime?.reviewMode && <ui_js_1.Alert>{t('Demo environment: your request will be saved in the running server and will be lost when it restarts. No chauffeur is dispatched and no payment is collected.', 'Entorno de demostración: tu solicitud se guardará en el servidor en ejecución y se perderá al reiniciarlo. No se envía un conductor ni se cobra ningún pago.')}</ui_js_1.Alert>}</React.Fragment>}
    <div className={"form-actions"}>{step > 0 && <ui_js_1.Button tone={"quiet"} disabled={busy || d.submissionUncertain} onClick={() => go(step - 1)}><ui_js_1.Icon name={"arrow-left"}/>
        {t('Back', 'Atrás')}</ui_js_1.Button>}
    <ui_js_1.Button type={"submit"} busy={busy} disabled={step === 3 && (authLoading || authError || (!!user && !user.emailVerified) || runtime?.requestsEnabled === false)}>{step < 3 ? t('Continue', 'Continuar') : !user ? t('Sign in to continue', 'Inicia sesión para continuar') : d.submissionUncertain ? t('Retry the same request', 'Reintentar la misma solicitud') : t('Send journey request', 'Enviar solicitud de viaje')}
    <ui_js_1.Icon name={"arrow"}/></ui_js_1.Button></div>
    <p className={"expiry-note"}>{t('Drafts expire after 30 minutes. No payment is collected here.', 'Los borradores vencen a los 30 minutos. Aquí no se cobra ningún pago.')}</p></form>
    <aside className={"journey-summary"}><div className={"summary-top"}><p className={"eyebrow"}>{t('YOUR JOURNEY', 'TU VIAJE')}</p>
    <ui_js_1.Icon name={"plane"} size={26}/></div>
    <h3>{t(...SERVICE_NAMES[d.serviceTypeCode])}</h3>
    <div className={"summary-route"}><div className={"route-point"}><span />
    <div><small>{t('From', 'Desde')}</small>
    <strong>{d.pickupAddress || t('Your pickup location', 'Tu lugar de recogida')}</strong></div></div>
    <div className={"route-point"}><span />
    <div><small>{t('To', 'Hasta')}</small>
    <strong>{d.destinationAddress || t('Your destination', 'Tu destino')}</strong></div></div></div>
    <dl className={"summary-details"}><div><dt><ui_js_1.Icon name={"calendar"}/>
    {t('When', 'Cuándo')}</dt>
    <dd>{d.date || '—'}
    {" "}
    {d.time}
    <small>{d.zone}</small></dd></div>
    <div><dt><ui_js_1.Icon name={"users"}/>
    {t('Party', 'Grupo')}</dt>
    <dd>{d.passengers}
    {" \u00B7 "}
    {d.luggage}
    {" "}
    {t('bags', 'maletas')}</dd></div>
        {chosen && <div><dt><ui_js_1.Icon name={"car"}/>
        {t('Category', 'Categoría')}</dt>
        <dd>{chosen.name}</dd></div>}</dl>
    <p className={"summary-note"}>{t('Your request is the beginning. A confirmation is a separate, explicit step.', 'Tu solicitud es el comienzo. La confirmación es un paso separado y explícito.')}</p>
    <context_js_1.Link href={"/help"}>{t('A little guidance', 'Un poco de orientación')}
    {" "}
    <ui_js_1.Icon name={"arrow"} size={16}/></context_js_1.Link></aside></div></section>;
}
