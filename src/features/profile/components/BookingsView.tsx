'use client';

import { CalendarDays, CheckCircle2, Clock3, LoaderCircle, MessageSquareText, UsersRound, XCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';

import { bookingCopy } from '../lib/booking-copy';
import { BOOKING_TIMES, formatBookingDate, formatBookingTime, getTodayDate, isPastBookingTime } from '../lib/booking-utils';
import type { TBookingDraft, TTableBooking } from '../lib/booking-types';
import { useCustomerBookings } from '../lib/use-customer-bookings';
import type { TProfileLocale } from '../types';

const INITIAL_DRAFT: TBookingDraft = { date: '', time: '09:00', guests: 2, comment: '' };

export default function BookingsView({ locale }: { locale: TProfileLocale }) {
	const copy = bookingCopy[locale];
	const [draft, setDraft] = useState(INITIAL_DRAFT);
	const [message, setMessage] = useState('');
	const { bookings, cancelBooking, createBooking, isLoading, pendingId } = useCustomerBookings();
	const upcoming = bookings.filter(booking => booking.status === 'new' || booking.status === 'confirmed').sort(sortUpcoming);
	const history = bookings.filter(booking => booking.status === 'completed' || booking.status === 'cancelled');
	const unavailableTimes = new Set(upcoming.filter(booking => booking.booking_date === draft.date).map(booking => formatBookingTime(booking.booking_time)));
	const availableTimes = BOOKING_TIMES.filter(time => !isPastBookingTime(draft.date, time) && !unavailableTimes.has(time));
	const hasAvailableTimes = availableTimes.length > 0;
	const isSelectedTimeAvailable = availableTimes.includes(draft.time);

	function changeDate(date: string) {
		const blockedTimes = new Set(upcoming.filter(booking => booking.booking_date === date).map(booking => formatBookingTime(booking.booking_time)));
		const firstAvailableTime = BOOKING_TIMES.find(time => !isPastBookingTime(date, time) && !blockedTimes.has(time)) ?? '';
		setDraft(current => ({ ...current, date, time: firstAvailableTime }));
	}

	async function handleCreate(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setMessage('');
		if (!draft.date || !draft.time || isPastBookingTime(draft.date, draft.time)) return;
		const error = await createBooking(draft);
		if (error) {
			setMessage(error.message.includes('No tables') ? copy.unavailable : copy.error);
			return;
		}
		setDraft(INITIAL_DRAFT);
		setMessage(copy.created);
	}

	async function handleCancel(id: string) {
		if (!window.confirm(copy.cancelConfirm)) return;
		setMessage('');
		const error = await cancelBooking(id);
		if (error) setMessage(copy.error);
	}

	return (
		<section id='bookings' className='mt-5 scroll-mt-4 space-y-5'>
			<form className='rounded-3xl border border-[#e2d5c8] bg-white/75 p-5 shadow-[0_16px_44px_rgba(60,42,30,0.06)] sm:p-7' onSubmit={handleCreate}>
				<div className='flex items-start gap-3'><span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#efe3d6] text-[var(--accent)]'><CalendarDays size={20} /></span><div><h2 className='text-xl font-semibold'>{copy.title}</h2><p className='mt-1 text-sm leading-6 text-[var(--muted)]'>{copy.subtitle}</p></div></div>
				<div className='mt-6 grid gap-4 sm:grid-cols-3'>
					<label className='grid gap-2 text-sm font-medium'>{copy.date}<input className='h-11 rounded-xl border border-[#ddcfc2] bg-[#fffdfb] px-3 outline-none transition focus:border-[var(--accent)]' min={getTodayDate()} onChange={event => changeDate(event.target.value)} required type='date' value={draft.date} /></label>
					<label className='grid gap-2 text-sm font-medium'>{copy.time}<select className='h-11 cursor-pointer rounded-xl border border-[#ddcfc2] bg-[#fffdfb] px-3 outline-none transition focus:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60' disabled={Boolean(draft.date) && !hasAvailableTimes} onChange={event => setDraft(current => ({ ...current, time: event.target.value }))} value={draft.time}>{BOOKING_TIMES.map(time => { const disabled = Boolean(draft.date) && (isPastBookingTime(draft.date, time) || unavailableTimes.has(time)); return <option disabled={disabled} key={time} value={time}>{time}</option>; })}</select></label>
					<label className='grid gap-2 text-sm font-medium'>{copy.guests}<select className='h-11 cursor-pointer rounded-xl border border-[#ddcfc2] bg-[#fffdfb] px-3 outline-none transition focus:border-[var(--accent)]' onChange={event => setDraft(current => ({ ...current, guests: Number(event.target.value) }))} value={draft.guests}>{Array.from({ length: 12 }, (_, index) => index + 1).map(value => <option key={value} value={value}>{value}</option>)}</select></label>
				</div>
				<label className='mt-4 grid gap-2 text-sm font-medium'>{copy.comment}<textarea className='min-h-24 resize-y rounded-xl border border-[#ddcfc2] bg-[#fffdfb] px-3 py-3 outline-none transition focus:border-[var(--accent)]' maxLength={500} onChange={event => setDraft(current => ({ ...current, comment: event.target.value }))} placeholder={copy.commentPlaceholder} value={draft.comment} /></label>
				<div className='mt-5 flex flex-wrap items-center justify-between gap-3'>{message ? <p className='text-sm text-[var(--muted)]'>{message}</p> : draft.date && !hasAvailableTimes ? <p className='text-sm text-red-500'>{copy.unavailable}</p> : <span />}<button className='inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60' disabled={pendingId === 'new' || !draft.date || !isSelectedTimeAvailable} type='submit'>{pendingId === 'new' ? <LoaderCircle className='animate-spin' size={17} /> : <CalendarDays size={17} />}{pendingId === 'new' ? copy.submitting : copy.submit}</button></div>
			</form>

			<BookingGroup bookings={upcoming} copy={copy} isLoading={isLoading} locale={locale} onCancel={handleCancel} pendingId={pendingId} title={copy.upcoming} />
			{history.length > 0 ? <BookingGroup bookings={history} copy={copy} isLoading={false} locale={locale} onCancel={handleCancel} pendingId={pendingId} title={copy.history} /> : null}
		</section>
	);
}

function BookingGroup({ bookings, copy, isLoading, locale, onCancel, pendingId, title }: { bookings: TTableBooking[]; copy: (typeof bookingCopy)[TProfileLocale]; isLoading: boolean; locale: TProfileLocale; onCancel: (id: string) => void; pendingId: string | null; title: string }) {
	return <section className='rounded-3xl border border-[#e2d5c8] bg-white/60 p-4 sm:p-6'><h3 className='text-base font-semibold'>{title}</h3>{isLoading ? <div className='mt-4 grid gap-3'>{[0, 1].map(item => <div className='h-28 animate-pulse rounded-2xl bg-[#eee4da]' key={item} />)}</div> : bookings.length === 0 ? <div className='mt-4 flex min-h-32 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dcccc0] text-center text-sm text-[var(--muted)]'><CalendarDays className='mb-3' size={24} />{copy.empty}</div> : <div className='mt-4 grid gap-3'>{bookings.map(booking => <BookingCard booking={booking} copy={copy} key={booking.id} locale={locale} onCancel={onCancel} pending={pendingId === booking.id} />)}</div>}</section>;
}

function BookingCard({ booking, copy, locale, onCancel, pending }: { booking: TTableBooking; copy: (typeof bookingCopy)[TProfileLocale]; locale: TProfileLocale; onCancel: (id: string) => void; pending: boolean }) {
	const isCancelled = booking.status === 'cancelled';
	const StatusIcon = isCancelled ? XCircle : CheckCircle2;
	return <article className='rounded-2xl border border-[#e5d9ce] bg-[#fffdfb] p-4 sm:p-5'><div className='flex flex-wrap items-start justify-between gap-3'><div><p className='font-semibold'>{formatBookingDate(booking.booking_date, locale)}</p><div className='mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--muted)]'><span className='inline-flex items-center gap-1.5'><Clock3 size={15} />{formatBookingTime(booking.booking_time)}</span><span className='inline-flex items-center gap-1.5'><UsersRound size={15} />{booking.guest_count} {copy.person}</span></div></div><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${statusTone(booking.status)}`}><StatusIcon size={14} />{copy.statuses[booking.status]}</span></div>{booking.comment ? <p className='mt-4 flex items-start gap-2 rounded-xl bg-[#f6eee6] p-3 text-sm text-[var(--muted)]'><MessageSquareText className='mt-0.5 shrink-0' size={15} />{booking.comment}</p> : null}{booking.status === 'new' ? <button className='mt-4 cursor-pointer text-sm font-semibold text-red-500 hover:underline disabled:cursor-wait disabled:opacity-50' disabled={pending} onClick={() => onCancel(booking.id)} type='button'>{pending ? copy.cancelling : copy.cancel}</button> : null}</article>;
}

function sortUpcoming(first: TTableBooking, second: TTableBooking) {
	return `${first.booking_date}T${first.booking_time}`.localeCompare(`${second.booking_date}T${second.booking_time}`);
}

function statusTone(status: TTableBooking['status']) {
	if (status === 'new') return 'bg-[#fff1d7] text-[#8a621b]';
	if (status === 'confirmed') return 'bg-[#e7f0e2] text-[#526c48]';
	if (status === 'cancelled') return 'bg-[#f7e3df] text-[#9a433d]';
	return 'bg-[#ece8e4] text-[#675e58]';
}
