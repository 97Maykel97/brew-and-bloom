'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';

import { getHomeProductCopy } from '@/features/catalog/home-product-copy';
import {
	getHomeProduct,
	type THomeProductKey,
} from '@/features/catalog/home-products';
import { createClient } from '@/lib/supabase/client';
import { notifyFavoriteChanged } from '@/features/catalog/favorite-events';
import type { TProfileCopy } from '../profile-copy';
import type { TProfileLocale } from '../types';
import CustomerProductCard from './CustomerProductCard';
import EmptyState from './EmptyState';

type TFavoriteRow = {
	created_at: string;
	product_key: THomeProductKey;
};

type TFavoritesViewProps = {
	copy: TProfileCopy;
	locale: TProfileLocale;
};

export default function FavoritesView({ copy, locale }: TFavoritesViewProps) {
	const [favorites, setFavorites] = useState<TFavoriteRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const productCopy = getHomeProductCopy(locale);

	useEffect(() => {
		let isActive = true;

		async function loadFavorites() {
			const supabase = createClient();
			const { data } = await supabase
				.from('product_favorites')
				.select('product_key, created_at')
				.order('created_at', { ascending: false });

			if (!isActive) return;
			setFavorites((data as TFavoriteRow[] | null) ?? []);
			setIsLoading(false);
		}

		void loadFavorites();
		return () => {
			isActive = false;
		};
	}, []);

	async function removeFavorite(productKey: THomeProductKey) {
		const previous = favorites;
		setFavorites(current =>
			current.filter(item => item.product_key !== productKey),
		);

		const supabase = createClient();
		const { error } = await supabase
			.from('product_favorites')
			.delete()
			.eq('product_key', productKey);

		if (error) setFavorites(previous);
		else notifyFavoriteChanged(productKey, false);
	}

	if (isLoading) {
		return <div className='mt-5 h-44 animate-pulse rounded-2xl bg-white/55' />;
	}

	if (favorites.length === 0) {
		return (
			<EmptyState
				id='favorites'
				icon={<Heart size={24} strokeWidth={1.6} />}
				title={copy.emptyFavorites}
				description={copy.emptyFavoritesText}
				actionLabel={copy.explore}
				actionHref={'/' + locale + '/menu'}
			/>
		);
	}

	return (
		<div id='favorites' className='mt-5 grid gap-3'>
			{favorites.map(item => {
				const product = getHomeProduct(item.product_key);
				if (!product) return null;

				return (
					<CustomerProductCard
						actionLabel={`Remove ${productCopy[item.product_key].name}`}
						description={productCopy[item.product_key].description}
						key={item.product_key}
						name={productCopy[item.product_key].name}
						onAction={() => void removeFavorite(item.product_key)}
						product={product}
					/>
				);
			})}
		</div>
	);
}
