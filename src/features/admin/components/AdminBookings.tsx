'use client';

import { CalendarDays, Check, Clock3, LoaderCircle, Search, UsersRound, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { formatPhoneNumber } from '@/features/profile/lib/profile-formatters';
import { formatBookingDate, formatBookingTime } from '@/features/profile/lib/booking-utils';
import type { TBookingStatus, TTableBooking } from '@/features/profile/lib/booking-types';
import { createClient } from '@/lib/supabase/client';
import type { TAdminLocale } from '../types';

type TProfile = { id: string; first_name: string | null; last_name: string | null; phone: string | null };
type TFilter = 'all' | TBookingStatus;

const COPY = {
	ru: { title: 'Бронирования', capacity: 'Столиков на один временной слот', saveCapacity: 'Сохранить', search: 'Найти клиента по имени', all: 'Все', empty: 'Бронирования не найдены', client: 'Клиент', phone: 'Телефон', guests: 'гостей', comment: 'Комментарий', confirm: 'Подтвердить', complete: 'Завершить', cancel: 'Отменить', error: 'Не удалось обновить бронирование.', statuses: { new: 'Новые', confirmed: 'Подтверждённые', completed: 'Завершённые', cancelled: 'Отменённые' } },
	en: { title: 'Bookings', capacity: 'Tables available per time slot', saveCapacity: 'Save', search: 'Search customer by name', all: 'All', empty: 'No bookings found', client: 'Customer', phone: 'Phone', guests: 'guests', comment: 'Comment', confirm: 'Confirm', complete: 'Complete', cancel: 'Cancel', error: 'Could not update the booking.', statuses: { new: 'New', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' } },
	he: { title: 'הזמנות שולחן', capacity: 'שולחנות זמינים בכל משבצת זמן', saveCapacity: 'שמירה', search: 'חיפוש לקוח לפי שם', all: 'הכל', empty: 'לא נמצאו הזמנות שולחן', client: 'לקוח', phone: 'טלפון', guests: 'אורחים', comment: 'הערה', confirm: 'אישור', complete: 'השלמה', cancel: 'ביטול', error: 'לא ניתן לעדכן את ההזמנה.', statuses: { new: 'חדשות', confirmed: 'מאושרות', completed: 'הושלמו', cancelled: 'בוטלו' } },
} as const;

export default function AdminBookings({ locale }: { locale: TAdminLocale }) {
	const copy = COPY[locale];
	const [bookings, setBookings] = useState<TTableBooking[]>([]);
	const [profiles, setProfiles] = useState<Map<string, TProfile>>(new Map());
	const [filter, setFilter] = useState<TFilter>('all');
	const [query, setQuery] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [error, setError] = useState('');
	const [maxTables, setMaxTables] = useState(8);
	const [isSavingCapacity, setIsSavingCapacity] = useState(false);

	const loadBookings = useCallback(async () => {
		const supabase = createClient();
		const [bookingResult, profileResult, settingsResult] = await Promise.all([
			supabase.from('table_bookings').select('*').order('booking_date', { ascending: true }).order('booking_time', { ascending: true }),
			supabase.from('profiles').select('id, first_name, last_name, phone'),
			supabase.from('booking_settings').select('max_tables_per_slot').eq('id', true).maybeSingle(),
		]);
		setBookings((bookingResult.data as TTableBooking[] | null) ?? []);
		setProfiles(new Map(((profileResult.data as TProfile[] | null) ?? []).map(profile => [profile.id, profile])));
		if (typeof settingsResult.data?.max_tables_per_slot === 'number') setMaxTables(settingsResult.data.max_tables_per_slot);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const timer = window.setTimeout(() => void loadBookings(), 0);
		const supabase = createClient();
		const channel = supabase.channel(`admin-bookings-${crypto.randomUUID()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'table_bookings' }, () => void loadBookings()).subscribe();
		return () => { window.clearTimeout(timer); void supabase.removeChannel(channel); };
	}, [loadBookings]);

	const visibleBookings = useMemo(() => {
		const normalizedQuery = query.trim().toLocaleLowerCase();
		return bookings.filter(booking => {
			if (filter !== 'all' && booking.status !== filter) return false;
			if (!normalizedQuery) return true;
			const profile = profiles.get(booking.user_id);
			return `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.toLocaleLowerCase().includes(normalizedQuery);
		}).sort(sortBookings);
	}, [bookings, filter, profiles, query]);

	async function changeStatus(booking: TTableBooking, status: TBookingStatus) {
		setPendingId(booking.id);
		setError('');
		const { error: updateError } = await createClient().rpc('admin_set_table_booking_status', { p_booking_id: booking.id, p_status: status });
		setPendingId(null);
		if (updateError) { setError(copy.error); return; }
		await loadBookings();
	}

	async function saveCapacity() {
		setIsSavingCapacity(true); setError('');
		const { error: updateError } = await createClient().from('booking_settings').update({ max_tables_per_slot: maxTables, updated_at: new Date().toISOString() }).eq('id', true);
		setIsSavingCapacity(false);
		if (updateError) setError(copy.error);
	}

	const filters: TFilter[] = ['all', 'new', 'confirmed', 'completed', 'cancelled'];
	return <section className='space-y-5'>
		<header className='rounded-3xl border border-[#e2d5c8] bg-white/75 p-5 sm:p-6'><div className='flex flex-wrap items-center justify-between gap-4'><div className='flex items-center gap-3'><span className='flex h-11 w-11 items-center justify-center rounded-full bg-[#efe3d6] text-[var(--accent)]'><CalendarDays size={20} /></span><h2 className='text-2xl font-semibold'>{copy.title}</h2></div><div className='flex items-end gap-2'><label className='grid gap-1 text-xs font-medium text-[var(--muted)]'>{copy.capacity}<input className='h-10 w-24 rounded-xl border border-[#ddcfc2] bg-white px-3 text-center text-sm font-bold outline-none' max={30} min={1} onChange={event => setMaxTables(Math.max(1, Math.min(30, Number(event.target.value) || 1)))} type='number' value={maxTables} /></label><button className='h-10 cursor-pointer rounded-xl bg-[var(--accent)] px-4 text-xs font-semibold text-white disabled:cursor-wait disabled:opacity-60' disabled={isSavingCapacity} onClick={() => void saveCapacity()} type='button'>{copy.saveCapacity}</button></div></div><div className='mt-5 flex items-center gap-2 rounded-2xl border border-[#dfd2c5] bg-white px-4'><Search className='text-[var(--muted)]' size={17} /><input className='h-11 min-w-0 flex-1 bg-transparent text-sm outline-none' onChange={event => setQuery(event.target.value)} placeholder={copy.search} value={query} />{query ? <button className='cursor-pointer text-[var(--muted)]' onClick={() => setQuery('')} type='button'><X size={16} /></button> : null}</div><div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5'>{filters.map(item => <button className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold transition ${filter === item ? 'bg-[var(--accent)] text-white' : 'bg-[#f3e9df] text-[var(--muted)] hover:bg-[#eadbcd]'}`} key={item} onClick={() => setFilter(item)} type='button'>{item === 'all' ? copy.all : copy.statuses[item]}</button>)}</div></header>
		{error ? <p className='rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600'>{error}</p> : null}
		{isLoading ? <div className='flex min-h-48 items-center justify-center'><LoaderCircle className='animate-spin text-[var(--accent)]' /></div> : visibleBookings.length === 0 ? <div className='flex min-h-48 flex-col items-center justify-center rounded-3xl border border-dashed border-[#dcccc0] bg-white/50 text-[var(--muted)]'><CalendarDays className='mb-3' />{copy.empty}</div> : <div className='grid gap-3'>{visibleBookings.map(booking => <AdminBookingCard booking={booking} copy={copy} key={booking.id} locale={locale} onStatusChange={changeStatus} pending={pendingId === booking.id} profile={profiles.get(booking.user_id)} />)}</div>}
	</section>;
}

function AdminBookingCard({ booking, copy, locale, onStatusChange, pending, profile }: { booking: TTableBooking; copy: (typeof COPY)[TAdminLocale]; locale: TAdminLocale; onStatusChange: (booking: TTableBooking, status: TBookingStatus) => void; pending: boolean; profile?: TProfile }) {
	const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || copy.client;
	return <article className='overflow-hidden rounded-2xl border border-[#dfd2c5] bg-white/75'><div className='flex flex-wrap items-start justify-between gap-3 bg-[#f0e4d7] px-4 py-4 sm:px-5'><div><p className='font-semibold'>{formatBookingDate(booking.booking_date, locale)} · {formatBookingTime(booking.booking_time)}</p><p className='mt-1 text-xs text-[var(--muted)]'>#{booking.id.slice(0, 8).toUpperCase()}</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone(booking.status)}`}>{copy.statuses[booking.status]}</span></div><div className='p-4 sm:p-5'><div className='grid gap-2 text-sm sm:grid-cols-2'><p className='font-semibold'>{copy.client}: {name}</p>{profile?.phone ? <p className='text-[var(--muted)] sm:text-end'>{copy.phone}: <bdi dir='ltr'>{formatPhoneNumber(profile.phone)}</bdi></p> : null}<p className='inline-flex items-center gap-2 text-[var(--muted)]'><UsersRound size={16} />{booking.guest_count} {copy.guests}</p><p className='inline-flex items-center gap-2 text-[var(--muted)] sm:justify-end'><Clock3 size={16} />{formatBookingTime(booking.booking_time)}</p></div>{booking.comment ? <p className='mt-4 rounded-xl bg-[#f7f0e8] p-3 text-sm text-[var(--muted)]'>{copy.comment}: {booking.comment}</p> : null}<div className='mt-4 flex flex-wrap justify-end gap-2'>{booking.status === 'new' ? <ActionButton disabled={pending} label={copy.confirm} onClick={() => onStatusChange(booking, 'confirmed')} primary /> : null}{booking.status === 'confirmed' ? <ActionButton disabled={pending} label={copy.complete} onClick={() => onStatusChange(booking, 'completed')} primary /> : null}{booking.status === 'new' || booking.status === 'confirmed' ? <ActionButton disabled={pending} label={copy.cancel} onClick={() => onStatusChange(booking, 'cancelled')} /> : null}{pending ? <LoaderCircle className='animate-spin self-center text-[var(--muted)]' size={17} /> : booking.status === 'completed' ? <Check className='self-center text-[#526c48]' size={18} /> : null}</div></div></article>;
}

function ActionButton({ disabled, label, onClick, primary = false }: { disabled: boolean; label: string; onClick: () => void; primary?: boolean }) {
	return <button className={`min-h-9 cursor-pointer rounded-full px-4 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${primary ? 'bg-[var(--accent)] text-white' : 'border border-[#dbcabc] bg-white text-red-500'}`} disabled={disabled} onClick={onClick} type='button'>{label}</button>;
}

function sortBookings(first: TTableBooking, second: TTableBooking) {
	const terminalDifference = Number(['completed', 'cancelled'].includes(first.status)) - Number(['completed', 'cancelled'].includes(second.status));
	return terminalDifference || `${first.booking_date}T${first.booking_time}`.localeCompare(`${second.booking_date}T${second.booking_time}`);
}

function statusTone(status: TBookingStatus) {
	if (status === 'new') return 'bg-[#fff1d7] text-[#8a621b]';
	if (status === 'confirmed') return 'bg-[#e7f0e2] text-[#526c48]';
	if (status === 'cancelled') return 'bg-[#f7e3df] text-[#9a433d]';
	return 'bg-[#ece8e4] text-[#675e58]';
}
