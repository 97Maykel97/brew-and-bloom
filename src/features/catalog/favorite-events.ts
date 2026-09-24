import type { THomeProductKey } from './home-products';

export const FAVORITE_CHANGED_EVENT = 'brew-bloom:favorite-changed';

export type TFavoriteChangedDetail = {
	isFavorite: boolean;
	productKey: THomeProductKey;
};

export function notifyFavoriteChanged(
	productKey: THomeProductKey,
	isFavorite: boolean,
) {
	window.dispatchEvent(
		new CustomEvent<TFavoriteChangedDetail>(FAVORITE_CHANGED_EVENT, {
			detail: { isFavorite, productKey },
		}),
	);
}
