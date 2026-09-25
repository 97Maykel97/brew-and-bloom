'use client';

import { CalendarDays } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Container from '@/components/common/Container';
import { createClient } from '@/lib/supabase/client';
import EventCard from './EventCard';
import EventDialog from './EventDialog';
import { eventsCopy } from './events-copy';
import type { TEventRegistration, TEventType, TPublicEvent } from './types';

type TFilter = 'all' | TEventType;

export default function EventsScreen({ locale }: { locale: string }) {
	const currentLocale = locale === 'en' || locale === 'he' ? locale : 'ru';
	const copy = eventsCopy[currentLocale];
	const router = useRouter();
	const [events, setEvents] = useState<TPublicEvent[]>([]);
	const [registrations, setRegistrations] = useState<TEventRegistration[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<TPublicEvent | null>(null);
	const [filter, setFilter] = useState<TFilter>('all');
	const [guestCount, setGuestCount] = useState(1);
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isPending, setIsPending] = useState(false);
	const [message, setMessage] = useState('');
	const [loadError, setLoadError] = useState('');
	const hasHandledRequestedEvent = useRef(false);

	const loadData = useCallback(async () => {
		const supabase = createClient();
		const [{ data: eventRows, error: eventsError }, { data: authData }] = await Promise.all([
			supabase.rpc('get_public_events'),
			supabase.auth.getUser(),
		]);
		const user = authData.user;
		let registrationRows: TEventRegistration[] = [];
		if (user) {
			const { data } = await supabase.from('event_registrations').select('*').order('created_at', { ascending: false });
			registrationRows = (data as TEventRegistration[] | null) ?? [];
		}
		if (!eventsError) {
			const nextEvents = (eventRows as TPublicEvent[] | null) ?? [];
			setEvents(nextEvents);
			setSelectedEvent(current => current ? nextEvents.find(event => event.id === current.id) ?? null : current);
			if (!hasHandledRequestedEvent.current) {
				const requestedId = window.location.hash.startsWith('#event-') ? window.location.hash.slice(7) : '';
				if (requestedId) setSelectedEvent(nextEvents.find(event => event.id === requestedId) ?? null);
				hasHandledRequestedEvent.current = true;
			}
			setLoadError('');
		} else {
			setLoadError(copy.error);
		}
		setRegistrations(registrationRows);
		setIsSignedIn(Boolean(user));
		setIsLoading(false);
	}, [copy.error]);

	useEffect(() => {
		const initialLoadTimer = window.setTimeout(() => void loadData(), 0);
		const refreshTimer = window.setInterval(() => void loadData(), 15_000);
		const supabase = createClient();
		const channel = supabase
			.channel(`events-page-${crypto.randomUUID()}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => void loadData())
			.on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => void loadData())
			.subscribe();
		return () => {
			window.clearTimeout(initialLoadTimer);
			window.clearInterval(refreshTimer);
			void supabase.removeChannel(channel);
		};
	}, [loadData]);

	const visibleEvents = useMemo(
		() => filter === 'all' ? events : events.filter(event => event.event_type === filter),
		[events, filter],
	);

	function openEvent(event: TPublicEvent) {
		setSelectedEvent(event);
		setGuestCount(1);
		setMessage('');
	}

	function closeEvent() {
		if (isPending) return;
		setSelectedEvent(null);
		setMessage('');
	}

	async function register(event: TPublicEvent) {
		if (!isSignedIn) {
			const next = `/${currentLocale}/events#event-${event.id}`;
			router.push(`/${currentLocale}/auth/login?next=${encodeURIComponent(next)}`);
			return;
		}
		setIsPending(true);
		setMessage('');
		const { error } = await createClient().rpc('register_for_event', { p_event_id: event.id, p_guest_count: guestCount });
		setIsPending(false);
		if (error) setMessage(copy.error);
		else { setMessage(copy.registered); await loadData(); }
	}

	async function cancelRegistration(registration: TEventRegistration) {
		if (!window.confirm(copy.cancelConfirm)) return;
		setIsPending(true);
		setMessage('');
		const { error } = await createClient().rpc('cancel_event_registration', { p_registration_id: registration.id });
		setIsPending(false);
		if (error) setMessage(copy.error);
		else await loadData();
	}

	return (
		<main className='min-h-screen bg-[#f8f3ec] pb-20 text-[var(--foreground)]' dir={currentLocale === 'he' ? 'rtl' : 'ltr'}>
			<section className='border-b border-[#e2d5c8] bg-[#efe4d8] py-14 sm:py-20'>
				<Container>
					<p className='text-xs font-bold uppercase tracking-[0.16em] text-[#8a6d5a]'>{copy.eyebrow}</p>
					<h1 className='mt-3 max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.035em] sm:text-7xl'>{copy.title}</h1>
					<p className='mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base'>{copy.description}</p>
				</Container>
			</section>

			<Container>
				<div className='flex flex-wrap gap-2 py-7'>
					{(['all', 'coffee', 'latte_art', 'music', 'community'] as TFilter[]).map(item => (
						<button className={`min-h-10 cursor-pointer rounded-full px-4 text-sm font-semibold transition ${filter === item ? 'bg-[var(--accent)] text-white' : 'border border-[#ddcfc2] bg-white/70 text-[var(--muted)] hover:border-[var(--accent)]'}`} key={item} onClick={() => setFilter(item)} type='button'>{item === 'all' ? copy.all : copy.types[item]}</button>
					))}
				</div>

				{loadError ? (
					<p className='mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>{loadError}</p>
				) : null}

				<div className='min-h-[550px]'>
					{isLoading ? <EventsSkeleton /> : visibleEvents.length === 0 ? (
						<div className='flex min-h-[550px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#d8c8ba] bg-white/55 text-center text-[var(--muted)]'><CalendarDays className='mb-3' size={28} /><p>{loadError || copy.empty}</p></div>
					) : (
						<div className='grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3'>
							{visibleEvents.map(event => <EventCard copy={copy} event={event} key={event.id} locale={currentLocale} onOpen={() => openEvent(event)} registration={registrations.find(item => item.event_id === event.id && item.status !== 'cancelled')} />)}
						</div>
					)}
				</div>
			</Container>

			{selectedEvent ? (
				<EventDialog copy={copy} event={selectedEvent} guestCount={guestCount} isPending={isPending} isSignedIn={isSignedIn} locale={currentLocale} message={message} onCancel={cancelRegistration} onClose={closeEvent} onGuestCountChange={setGuestCount} onOpenProfile={() => router.push(`/${currentLocale}/profile?tab=events#events`)} onRegister={register} registration={registrations.find(item => item.event_id === selectedEvent.id && item.status !== 'cancelled')} />
			) : null}
		</main>
	);
}

function EventsSkeleton() {
	return (
		<div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
			{[0, 1, 2].map(item => (
				<div className='h-[550px] animate-pulse rounded-3xl bg-[#eadfd4]' key={item} />
			))}
		</div>
	);
}
