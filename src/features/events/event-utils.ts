import type { TProfileLocale } from '@/features/profile/types';
import type { TPublicEvent } from './types';

export function getLocalizedEventText(
	event: TPublicEvent,
	field: 'title' | 'description',
	locale: TProfileLocale,
) {
	const value = event[`${field}_${locale}`] || event[`${field}_ru`];
	return field === 'title' ? preventHyphenatedWordBreaks(value) : value;
}

export function formatEventDate(date: string, locale: TProfileLocale) {
	const localeCode = locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB';
	return new Intl.DateTimeFormat(localeCode, {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(new Date(`${date}T12:00:00`));
}

export function formatEventTime(event: TPublicEvent) {
	return `${event.start_time.slice(0, 5)}–${event.end_time.slice(0, 5)}`;
}

export function getEventImage(event: TPublicEvent) {
	return event.event_type === 'music' || event.event_type === 'community'
		? '/event-cafe-evening.webp'
		: '/event-coffee-tasting.webp';
}

function preventHyphenatedWordBreaks(value: string) {
	return value.replace(
		/([A-Za-zА-Яа-яЁё])-([A-Za-zА-Яа-яЁё])/g,
		'$1‑$2',
	);
}
