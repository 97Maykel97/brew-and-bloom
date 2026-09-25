import type {
	TOrderStatus,
	TProfileLocale,
	TProfileTab,
} from '../types';

const PROFILE_TABS: TProfileTab[] = [
	'profile',
	'orders',
	'bookings',
	'events',
	'favorites',
	'bonuses',
	'settings',
];

const ORDER_STATUSES: TOrderStatus[] = [
	'all',
	'processing',
	'preparing',
	'ready',
	'completed',
	'cancelled',
];

export function getProfileLocale(locale: string): TProfileLocale {
	return locale === 'en' || locale === 'he' ? locale : 'ru';
}

export function getProfileTab(tab?: string): TProfileTab {
	return PROFILE_TABS.includes(tab as TProfileTab)
		? (tab as TProfileTab)
		: 'profile';
}

export function getOrderStatus(status?: string): TOrderStatus {
	return ORDER_STATUSES.includes(status as TOrderStatus)
		? (status as TOrderStatus)
		: 'all';
}

export function formatPhoneNumber(value: string): string {
	const digits = value.replace(/\D/g, '');

	if (digits.startsWith('972')) {
		const localNumber = digits.slice(3).replace(/^0/, '');

		if (localNumber.length === 9) {
			return [
				'+972 ' + localNumber.slice(0, 2),
				localNumber.slice(2, 5),
				localNumber.slice(5),
			].join('-');
		}
	}

	if (digits.length === 10 && digits.startsWith('0')) {
		return [
			digits.slice(0, 3),
			digits.slice(3, 6),
			digits.slice(6),
		].join('-');
	}

	if (digits.length === 9 && digits.startsWith('5')) {
		return [
			'+972 ' + digits.slice(0, 2),
			digits.slice(2, 5),
			digits.slice(5),
		].join('-');
	}

	return value;
}

export function formatBirthDate(
	value: string,
	locale: TProfileLocale,
): string {
	const [year, month, day] = value.split('-').map(Number);

	if (!year || !month || !day) {
		return value;
	}

	const date = new Date(Date.UTC(year, month - 1, day));
	const dateLocale =
		locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB';

	return new Intl.DateTimeFormat(dateLocale, {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(date);
}

export function getInitials(fullName: string): string {
	return fullName
		.split(' ')
		.filter(Boolean)
		.map(part => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
}
