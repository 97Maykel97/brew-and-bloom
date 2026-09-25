'use client';

import {
	CalendarPlus,
	LoaderCircle,
	Sparkles,
	X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { createClient } from '@/lib/supabase/client';
import {
	ADMIN_EVENTS_COPY,
	EMPTY_EVENT_DRAFT,
	isEventDraftComplete,
	type TAdminEvent,
	type TAdminEventRegistration,
	type TEventDraft,
	type TEventLanguage,
	type TEventParticipantProfile,
	type TEventRegistrationStatus,
} from '../lib/admin-events-config';
import type { TAdminLocale } from '../types';
import AdminEventCard from './AdminEventCard';
import AdminEventForm from './AdminEventForm';

export default function AdminEvents({ locale }: { locale: TAdminLocale }) {
	const copy = ADMIN_EVENTS_COPY[locale];
	const [events, setEvents] = useState<TAdminEvent[]>([]);
	const [registrations, setRegistrations] = useState<TAdminEventRegistration[]>([]);
	const [profiles, setProfiles] = useState<Map<string, TEventParticipantProfile>>(new Map());
	const [draft, setDraft] = useState<TEventDraft>(EMPTY_EVENT_DRAFT);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [activeLanguage, setActiveLanguage] = useState<TEventLanguage>(locale);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [pendingRegistrationId, setPendingRegistrationId] = useState<string | null>(null);
	const [error, setError] = useState('');

	const loadEvents = useCallback(async () => {
		const supabase = createClient();
		const [eventsResult, registrationsResult, profilesResult] = await Promise.all([
			supabase.from('events').select('*').order('event_date', { ascending: true }).order('start_time', { ascending: true }),
			supabase.from('event_registrations').select('*').order('created_at', { ascending: true }),
			supabase.from('profiles').select('id, first_name, last_name, phone'),
		]);

		if (eventsResult.error || registrationsResult.error || profilesResult.error) setError(ADMIN_EVENTS_COPY[locale].error);
		else {
			setEvents((eventsResult.data as TAdminEvent[] | null) ?? []);
			setRegistrations((registrationsResult.data as TAdminEventRegistration[] | null) ?? []);
			setProfiles(new Map(((profilesResult.data as TEventParticipantProfile[] | null) ?? []).map(profile => [profile.id, profile])));
		}
		setIsLoading(false);
	}, [locale]);

	useEffect(() => {
		const timer = window.setTimeout(() => void loadEvents(), 0);
		const supabase = createClient();
		const channel = supabase
			.channel(`admin-events-${crypto.randomUUID()}`)
			.on(
				'postgres_changes',
				{ event: '*', schema: 'public', table: 'events' },
				() => void loadEvents(),
			)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => void loadEvents())
			.subscribe();

		return () => {
			window.clearTimeout(timer);
			void supabase.removeChannel(channel);
		};
	}, [loadEvents]);

	const sortedEvents = useMemo(
		() => [...events].sort((first, second) =>
			`${first.event_date}T${first.start_time}`.localeCompare(
				`${second.event_date}T${second.start_time}`,
			),
		),
		[events],
	);

	function openCreateForm() {
		setDraft(EMPTY_EVENT_DRAFT);
		setEditingId(null);
		setActiveLanguage(locale);
		setError('');
		setIsFormOpen(true);
	}

	function openEditForm(event: TAdminEvent) {
		setDraft({
			event_type: event.event_type,
			title_ru: event.title_ru,
			title_en: event.title_en,
			title_he: event.title_he,
			description_ru: event.description_ru,
			description_en: event.description_en,
			description_he: event.description_he,
			event_date: event.event_date,
			start_time: event.start_time.slice(0, 5),
			end_time: event.end_time.slice(0, 5),
			capacity: event.capacity ?? 20,
			is_published: event.is_published,
		});
		setEditingId(event.id);
		setActiveLanguage(locale);
		setError('');
		setIsFormOpen(true);
	}

	function closeForm() {
		if (isSaving) return;
		setIsFormOpen(false);
		setEditingId(null);
		setDraft(EMPTY_EVENT_DRAFT);
	}

	async function saveEvent(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!isEventDraftComplete(draft)) return;

		setIsSaving(true);
		setError('');
		const supabase = createClient();
		const payload = {
			...draft,
			updated_at: new Date().toISOString(),
		};
		const result = editingId
			? await supabase.from('events').update(payload).eq('id', editingId)
			: await supabase.from('events').insert({
				...payload,
				slug: `event-${crypto.randomUUID()}`,
			});

		setIsSaving(false);
		if (result.error) {
			setError(copy.error);
			return;
		}

		closeForm();
		await loadEvents();
	}

	async function togglePublication(event: TAdminEvent) {
		if (pendingId) return;
		setPendingId(event.id);
		setError('');
		const { error: updateError } = await createClient()
			.from('events')
			.update({
				is_published: !event.is_published,
				updated_at: new Date().toISOString(),
			})
			.eq('id', event.id);
		setPendingId(null);
		if (updateError) setError(copy.error);
		else await loadEvents();
	}

	async function deleteEvent(event: TAdminEvent) {
		if (pendingId || !window.confirm(copy.deleteConfirm)) return;
		setPendingId(event.id);
		setError('');
		const { error: deleteError } = await createClient()
			.from('events')
			.delete()
			.eq('id', event.id);
		setPendingId(null);
		if (deleteError) setError(copy.error);
		else await loadEvents();
	}

	async function changeRegistrationStatus(id: string, status: TEventRegistrationStatus) {
		setPendingRegistrationId(id);
		setError('');
		const { error: updateError } = await createClient().rpc('admin_set_event_registration_status', { p_registration_id: id, p_status: status });
		setPendingRegistrationId(null);
		if (updateError) setError(copy.registrationError);
		else await loadEvents();
	}

	return (
		<section className='space-y-5'>
			<header className='rounded-3xl border border-[#dfd2c5] bg-white/75 p-5 shadow-[0_12px_35px_rgba(65,45,32,0.05)] sm:p-6'>
				<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
					<div className='flex items-center gap-3'>
						<span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-white'>
							<Sparkles size={20} />
						</span>
						<div>
							<h2 className='text-xl font-semibold'>{copy.title}</h2>
							<p className='mt-1 text-sm text-[var(--muted)]'>{copy.subtitle}</p>
						</div>
					</div>
					<button
						className='inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60'
						disabled={isSaving}
						onClick={isFormOpen ? closeForm : openCreateForm}
						type='button'
					>
						{isFormOpen ? <X size={17} /> : <CalendarPlus size={17} />}
						{isFormOpen ? copy.cancel : copy.add}
					</button>
				</div>

				{isFormOpen ? (
					<AdminEventForm
						activeLanguage={activeLanguage}
						copy={copy}
						draft={draft}
						isEditing={Boolean(editingId)}
						isSaving={isSaving}
						onDraftChange={setDraft}
						onLanguageChange={setActiveLanguage}
						onSubmit={saveEvent}
					/>
				) : null}
			</header>

			{error ? (
				<p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700'>{error}</p>
			) : null}

			{isLoading ? (
				<div className='flex min-h-64 items-center justify-center text-[var(--accent)]'>
					<LoaderCircle className='animate-spin' size={28} />
				</div>
			) : sortedEvents.length === 0 ? (
				<div className='flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-[#d8c8ba] bg-white/55 text-center'>
					<Sparkles className='text-[var(--muted)]' size={28} />
					<p className='mt-3 font-semibold'>{copy.empty}</p>
				</div>
			) : (
				<div className='grid gap-3'>
					{sortedEvents.map(event => (
						<AdminEventCard
							copy={copy}
							event={event}
							isPending={pendingId === event.id}
							key={event.id}
							locale={locale}
							registrations={registrations.filter(registration => registration.event_id === event.id)}
							profiles={profiles}
							pendingRegistrationId={pendingRegistrationId}
							onDelete={() => void deleteEvent(event)}
							onEdit={() => openEditForm(event)}
							onToggle={() => void togglePublication(event)}
							onRegistrationStatusChange={(id, status) => void changeRegistrationStatus(id, status)}
						/>
					))}
				</div>
			)}
		</section>
	);
}
