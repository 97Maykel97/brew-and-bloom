import {
	isSupportedLocale,
	type TLocale,
} from './languages';

export function getLocale(value: unknown): TLocale {
	return typeof value === 'string' && isSupportedLocale(value)
		? value
		: 'ru';
}
