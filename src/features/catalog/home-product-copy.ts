import enMessages from '@/messages/en.json';
import heMessages from '@/messages/he.json';
import ruMessages from '@/messages/ru.json';
import type { TProfileLocale } from '@/features/profile/types';
import type { THomeProductKey } from './home-products';

export type THomeProductCopy = Record<
	THomeProductKey,
	{ description: string; name: string }
>;

const productCopy: Record<TProfileLocale, THomeProductCopy> = {
	ru: ruMessages.home.bestsellers.products,
	en: enMessages.home.bestsellers.products,
	he: heMessages.home.bestsellers.products,
};

export function getHomeProductCopy(locale: TProfileLocale) {
	return productCopy[locale];
}
