'use client';

import { CalendarDays, Clock3, LoaderCircle, UsersRound } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { eventsCopy } from '@/features/events/events-copy';
import type { TEventRegistrationStatus, TEventType } from '@/features/events/types';
import { createClient } from '@/lib/supabase/client';
import type { TProfileLocale } from '../types';

type TRegistrationView = {
	registration_id: string;
	event_id: string;
	guest_count: number;
	status: TEventRegistrationStatus;
	title_ru: string;
	title_en: string;
	title_he: string;
	description_ru: string;
	description_en: string;
	description_he: string;
	event_type: TEventType;
	event_date: string;
	start_time: string;
	end_time: string;
};

const PROFILE_COPY = {
	ru: { title: 'Мои события', subtitle: 'Здесь собраны ваши предстоящие и прошедшие события.', upcoming: 'Предстоящие', history: 'История', empty: 'Вы пока не записаны на события', choose: 'Посмотреть события', cancel: 'Отменить запись', cancelling: 'Отменяем…', confirm: 'Отменить запись на событие?', error: 'Не удалось отменить запись.' },
	en: { title: 'My events', subtitle: 'Your upcoming and past event registrations are collected here.', upcoming: 'Upcoming', history: 'History', empty: 'You have not registered for any events yet', choose: 'Explore events', cancel: 'Cancel registration', cancelling: 'Cancelling…', confirm: 'Cancel your event registration?', error: 'Could not cancel the registration.' },
	he: { title: 'האירועים שלי', subtitle: 'כאן מופיעות ההרשמות הקרובות והקודמות שלך.', upcoming: 'אירועים קרובים', history: 'היסטוריה', empty: 'עדיין לא נרשמת לאירועים', choose: 'לצפייה באירועים', cancel: 'ביטול הרשמה', cancelling: 'מבטלים…', confirm: 'לבטל את ההרשמה לאירוע?', error: 'לא ניתן לבטל את ההרשמה.' },
} as const;

export default function EventRegistrationsView({ locale }: { locale: TProfileLocale }) {
	const copy = PROFILE_COPY[locale];
	const eventCopy = eventsCopy[locale];
	const [registrations, setRegistrations] = useState<TRegistrationView[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [error, setError] = useState('');

	const loadRegistrations = useCallback(async () => {
		const { data } = await createClient().rpc('get_my_event_registrations');
		setRegistrations((data as TRegistrationView[] | null) ?? []);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const initialLoadTimer = window.setTimeout(() => void loadRegistrations(), 0);
		const supabase = createClient();
		const channel = supabase.channel(`profile-events-${crypto.randomUUID()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => void loadRegistrations()).subscribe();
		return () => { window.clearTimeout(initialLoadTimer); void supabase.removeChannel(channel); };
	}, [loadRegistrations]);

	async function cancelRegistration(registration: TRegistrationView) {
		if (!window.confirm(copy.confirm)) return;
		setPendingId(registration.registration_id);
		setError('');
		const { error: cancelError } = await createClient().rpc('cancel_event_registration', { p_registration_id: registration.registration_id });
		setPendingId(null);
		if (cancelError) setError(copy.error);
		else await loadRegistrations();
	}

	const active = registrations.filter(item => item.status !== 'cancelled' && isUpcoming(item));
	const history = registrations.filter(item => item.status === 'cancelled' || !isUpcoming(item));

	return <section id='events' className='mt-5 scroll-mt-4 space-y-5'><header className='rounded-3xl border border-[#e2d5c8] bg-white/75 p-5 sm:p-7'><div className='flex items-start gap-3'><span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#efe3d6] text-[var(--accent)]'><CalendarDays size={20} /></span><div><h2 className='text-xl font-semibold'>{copy.title}</h2><p className='mt-1 text-sm leading-6 text-[var(--muted)]'>{copy.subtitle}</p></div></div></header>{error ? <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</p> : null}{isLoading ? <div className='flex min-h-48 items-center justify-center'><LoaderCircle className='animate-spin text-[var(--accent)]' /></div> : active.length === 0 && history.length === 0 ? <div className='flex min-h-60 flex-col items-center justify-center rounded-3xl border border-dashed border-[#dcccc0] bg-white/55 text-center'><CalendarDays className='text-[var(--accent)]' size={27} /><p className='mt-3 font-semibold'>{copy.empty}</p><Link className='mt-5 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-bold text-white' href={`/${locale}/events`}>{copy.choose}</Link></div> : <><RegistrationGroup copy={copy} eventCopy={eventCopy} items={active} locale={locale} onCancel={cancelRegistration} pendingId={pendingId} title={copy.upcoming} />{history.length > 0 ? <RegistrationGroup copy={copy} eventCopy={eventCopy} items={history} locale={locale} onCancel={cancelRegistration} pendingId={pendingId} title={copy.history} /> : null}</>}</section>;
}

function RegistrationGroup({ copy, eventCopy, items, locale, onCancel, pendingId, title }: { copy: (typeof PROFILE_COPY)[TProfileLocale]; eventCopy: (typeof eventsCopy)[TProfileLocale]; items: TRegistrationView[]; locale: TProfileLocale; onCancel: (item: TRegistrationView) => void; pendingId: string | null; title: string }) {
	return <section className='rounded-3xl border border-[#e2d5c8] bg-white/60 p-4 sm:p-6'><h3 className='font-semibold'>{title}</h3><div className='mt-4 grid gap-3'>{items.map(item => <article className='rounded-2xl border border-[#e5d9ce] bg-[#fffdfb] p-4 sm:p-5' key={item.registration_id}><div className='flex flex-wrap items-start justify-between gap-3'><div><span className='text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a6d5a]'>{eventCopy.types[item.event_type]}</span><h4 className='mt-2 text-lg font-semibold'>{item[`title_${locale}`] || item.title_ru}</h4><div className='mt-3 flex flex-wrap gap-4 text-sm text-[var(--muted)]'><span className='inline-flex items-center gap-1.5'><CalendarDays size={15} />{formatDate(item.event_date, locale)}</span><span className='inline-flex items-center gap-1.5'><Clock3 size={15} /><bdi>{item.start_time.slice(0, 5)}–{item.end_time.slice(0, 5)}</bdi></span><span className='inline-flex items-center gap-1.5'><UsersRound size={15} />{item.guest_count}</span></div></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone(item.status)}`}>{eventCopy.statuses[item.status]}</span></div>{item.status !== 'cancelled' && isUpcoming(item) ? <button className='mt-4 cursor-pointer text-sm font-semibold text-red-500 hover:underline disabled:cursor-wait disabled:opacity-50' disabled={pendingId === item.registration_id} onClick={() => onCancel(item)} type='button'>{pendingId === item.registration_id ? copy.cancelling : copy.cancel}</button> : null}</article>)}</div></section>;
}

function isUpcoming(item: TRegistrationView) { return `${item.event_date}T${item.end_time}` > new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jerusalem' }).replace(' ', 'T').slice(0, 16); }
function formatDate(date: string, locale: TProfileLocale) { return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`)); }
function statusTone(status: TEventRegistrationStatus) { return status === 'confirmed' ? 'bg-[#e7f0e2] text-[#526c48]' : status === 'cancelled' ? 'bg-[#f7e3df] text-[#9a433d]' : 'bg-[#fff1d7] text-[#8a621b]'; }
