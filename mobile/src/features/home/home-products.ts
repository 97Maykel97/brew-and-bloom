import classicCroissantImage from '@/assets/images/home-hits/classic-croissant.png';
import classicRafImage from '@/assets/images/home-hits/classic-raf.png';
import espressoTonicImage from '@/assets/images/home-hits/espresso-tonic.png';
import matchaLatteImage from '@/assets/images/home-hits/matcha-latte.png';
import type { THomeBestsellerProductKey } from '@/i18n/translations';

export type THomeProduct = {
	image: number;
	key: THomeBestsellerProductKey;
	price: number;
};

export const HOME_PRODUCTS: readonly THomeProduct[] = [
	{ image: classicRafImage, key: 'classicRaf', price: 320 },
	{ image: matchaLatteImage, key: 'matchaLatte', price: 340 },
	{ image: espressoTonicImage, key: 'espressoTonic', price: 290 },
	{ image: classicCroissantImage, key: 'classicCroissant', price: 220 },
];

export function getHomeProduct(productKey: string) {
	return HOME_PRODUCTS.find(product => product.key === productKey);
}
