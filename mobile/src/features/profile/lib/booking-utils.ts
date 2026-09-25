import type { TLocale } from '@/i18n/languages';

export const BOOKING_TIMES = Array.from({ length: 25 }, (_, index) => {
	const minutes = 9 * 60 + index * 30;
	return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
});

export function toBookingDate(date: Date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatBookingDate(value: string, locale: TLocale) {
	return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

export function getIsraelDateAndTime() {
	const parts = new Intl.DateTimeFormat('en-GB', { day: '2-digit', hour: '2-digit', hour12: false, minute: '2-digit', month: '2-digit', timeZone: 'Asia/Jerusalem', year: 'numeric' }).formatToParts(new Date());
	const value = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? '00';
	return { date: `${value('year')}-${value('month')}-${value('day')}`, time: `${value('hour')}:${value('minute')}` };
}

export function isPastBookingTime(date: string, time: string) {
	const current = getIsraelDateAndTime();
	return date === current.date && time <= current.time;
}
