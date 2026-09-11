import type { Locale } from './translations';

export function getLocale(value: unknown): Locale {
	if (value === 'en' || value === 'he') {
		return value;
	}

	return 'ru';
}
