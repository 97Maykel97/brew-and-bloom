import type { TProfileLocale } from '../types';

export const BOOKING_TIMES = Array.from({ length: 25 }, (_, index) => {
	const totalMinutes = 9 * 60 + index * 30;
	return `${String(Math.floor(totalMinutes / 60)).padStart(2, '0')}:${String(totalMinutes % 60).padStart(2, '0')}`;
});

export function getTodayDate() {
	const parts = new Intl.DateTimeFormat('en-CA', {
		day: '2-digit', month: '2-digit', timeZone: 'Asia/Jerusalem', year: 'numeric',
	}).formatToParts(new Date());
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '';
	return `${value('year')}-${value('month')}-${value('day')}`;
}

export function getCurrentBookingTime() {
	const parts = new Intl.DateTimeFormat('en-GB', {
		hour: '2-digit', hour12: false, minute: '2-digit', timeZone: 'Asia/Jerusalem',
	}).formatToParts(new Date());
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '00';
	return `${value('hour')}:${value('minute')}`;
}

export function isPastBookingTime(date: string, time: string) {
	return date === getTodayDate() && time <= getCurrentBookingTime();
}

export function formatBookingDate(date: string, locale: TProfileLocale) {
	const dateLocale = locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB';
	return new Intl.DateTimeFormat(dateLocale, {
		day: 'numeric', month: 'long', timeZone: 'Asia/Jerusalem', year: 'numeric',
	}).format(new Date(`${date}T12:00:00+03:00`));
}

export function formatBookingTime(time: string) {
	return time.slice(0, 5);
}
