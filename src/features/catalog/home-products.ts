export type THomeProductKey =
	| 'classicRaf'
	| 'matchaLatte'
	| 'espressoTonic'
	| 'classicCroissant';

export type THomeProduct = {
	image: string;
	key: THomeProductKey;
	price: number;
};

export const HOME_PRODUCTS: readonly THomeProduct[] = [
	{
		key: 'classicRaf',
		image: '/images/products/home-hits/classic-raf.png',
		price: 320,
	},
	{
		key: 'matchaLatte',
		image: '/images/products/home-hits/matcha-latte.png',
		price: 340,
	},
	{
		key: 'espressoTonic',
		image: '/images/products/home-hits/espresso-tonic.png',
		price: 290,
	},
	{
		key: 'classicCroissant',
		image: '/images/products/home-hits/classic-croissant.png',
		price: 220,
	},
];

export function getHomeProduct(productKey: string) {
	return HOME_PRODUCTS.find(product => product.key === productKey);
}
