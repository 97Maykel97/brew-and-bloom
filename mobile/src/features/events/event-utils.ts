import type { TLocale } from '@/i18n/translations';
import type { TPublicEvent } from './types';

export function getEventTitle(event: TPublicEvent, locale: TLocale) {
	const title = event[`title_${locale}`] || event.title_ru;
	return title.replace(
		/([A-Za-zА-Яа-яЁё])-([A-Za-zА-Яа-яЁё])/g,
		'$1‑$2',
	);
}

export function getEventDescription(event: TPublicEvent, locale: TLocale) {
	return event[`description_${locale}`] || event.description_ru;
}

export function formatEventDate(date: string, locale: TLocale) {
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
