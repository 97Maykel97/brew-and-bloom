import type { THomeBestsellerProductKey } from '@/i18n/translations';

type TFavoriteChangedListener = (
	productKey: THomeBestsellerProductKey,
	isFavorite: boolean,
) => void;

const listeners = new Set<TFavoriteChangedListener>();

export function notifyFavoriteChanged(
	productKey: THomeBestsellerProductKey,
	isFavorite: boolean,
) {
	listeners.forEach(listener => listener(productKey, isFavorite));
}

export function subscribeToFavoriteChanges(listener: TFavoriteChangedListener) {
	listeners.add(listener);

	return () => {
		listeners.delete(listener);
	};
}
