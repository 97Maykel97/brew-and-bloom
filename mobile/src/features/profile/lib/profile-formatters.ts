import type { TLocale } from '@/i18n/languages';

export function getString(value: unknown): string {
	return typeof value === 'string' ? value.trim() : '';
}

export function formatPhoneNumber(value: string): string {
	const digits = value.replace(/\D/g, '');

	if (digits.length === 12 && digits.startsWith('972')) {
		return (
			'+972 ' +
			digits.slice(3, 5) +
			'-' +
			digits.slice(5, 8) +
			'-' +
			digits.slice(8)
		);
	}

	return value;
}

export function formatBirthDate(value: string, locale: TLocale): string {
	const [year, month, day] = value.split('-');

	if (!year || !month || !day) {
		return '';
	}

	return locale === 'en'
		? [month, day, year].join('/')
		: [day, month, year].join('.');
}

export function getInitials(firstName: string, lastName: string): string {
	return [firstName, lastName]
		.filter(Boolean)
		.map(name => name.charAt(0).toUpperCase())
		.join('');
}
