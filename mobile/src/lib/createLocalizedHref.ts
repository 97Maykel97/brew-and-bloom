import type { Href } from 'expo-router';

import type { TLocale } from '@/i18n/languages';

type TLocalizedRoute = '/' | '/admin' | '/auth/login' | '/profile';

export function createLocalizedHref(
	pathname: TLocalizedRoute,
	locale: TLocale,
): Href {
	return (pathname + '?locale=' + locale) as Href;
}
