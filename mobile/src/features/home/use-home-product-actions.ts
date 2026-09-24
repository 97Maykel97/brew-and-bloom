import { useEffect, useState } from 'react';
import { router } from 'expo-router';

import type { THomeBestsellerProductKey, TLocale } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import {
	notifyFavoriteChanged,
	subscribeToFavoriteChanges,
} from '@/lib/favorite-events';
import { notifyOrderChanged, subscribeToOrderChanges } from '@/lib/order-modal-events';

type TProductAction = 'favorite' | 'order';

export function useHomeProductActions(locale: TLocale) {
	const [favoriteKeys, setFavoriteKeys] =
		useState<Set<THomeBestsellerProductKey>>(new Set());
	const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
	const [cartQuantities, setCartQuantities] = useState<Map<THomeBestsellerProductKey, number>>(new Map());
	const [isCartLoading, setIsCartLoading] = useState(true);
	const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
	const [lastOrderedKey, setLastOrderedKey] =
		useState<THomeBestsellerProductKey | null>(null);

	useEffect(() => {
		let isActive = true;

		async function loadCustomerState() {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!isActive) return;
			if (!user) {
				setIsFavoritesLoading(false);
				setIsCartLoading(false);
				return;
			}

			const [favoritesResult, cartResult] = await Promise.all([
				supabase.from('product_favorites').select('product_key').eq('user_id', user.id),
				supabase.from('customer_orders').select('product_key, quantity').eq('user_id', user.id).eq('status', 'cart'),
			]);

			if (!isActive) return;

			if (favoritesResult.data) setFavoriteKeys(
				new Set(
					favoritesResult.data.map(item => item.product_key as THomeBestsellerProductKey),
				),
			);
			if (cartResult.data) setCartQuantities(new Map(
				cartResult.data.map(item => [item.product_key as THomeBestsellerProductKey, item.quantity]),
			));
			setIsFavoritesLoading(false);
			setIsCartLoading(false);
		}

		void loadCustomerState();

		return () => {
			isActive = false;
		};
	}, []);

	useEffect(() => {
		let isActive = true;

		async function refreshCart() {
			const { data: { user } } = await supabase.auth.getUser();
			if (!user || !isActive) return;
			const { data } = await supabase
				.from('customer_orders')
				.select('product_key, quantity')
				.eq('user_id', user.id)
				.eq('status', 'cart');
			if (!isActive || !data) return;
			setCartQuantities(new Map(
				data.map(item => [item.product_key as THomeBestsellerProductKey, item.quantity]),
			));
		}

		const unsubscribe = subscribeToOrderChanges(() => void refreshCart());
		return () => {
			isActive = false;
			unsubscribe();
		};
	}, []);

	useEffect(
		() =>
			subscribeToFavoriteChanges((productKey, isFavorite) => {
				setFavoriteKeys(current => {
					const next = new Set(current);
					if (isFavorite) next.add(productKey);
					else next.delete(productKey);
					return next;
				});
			}),
		[],
	);

	function getActionKey(
		productKey: THomeBestsellerProductKey,
		action: TProductAction,
	) {
		return `${action}:${productKey}`;
	}

	function setActionPending(
		productKey: THomeBestsellerProductKey,
		action: TProductAction,
		isPending: boolean,
	) {
		const actionKey = getActionKey(productKey, action);

		setPendingActions(current => {
			const next = new Set(current);
			if (isPending) next.add(actionKey);
			else next.delete(actionKey);
			return next;
		});
	}

	async function getAuthenticatedUser() {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			router.push({ pathname: '/auth/login', params: { locale } });
			return null;
		}

		return user;
	}

	async function toggleFavorite(productKey: THomeBestsellerProductKey) {
		if (pendingActions.has(getActionKey(productKey, 'favorite'))) return;

		const user = await getAuthenticatedUser();
		if (!user) return;

		const wasFavorite = favoriteKeys.has(productKey);
		setActionPending(productKey, 'favorite', true);
		setFavoriteKeys(current => {
			const next = new Set(current);
			if (wasFavorite) next.delete(productKey);
			else next.add(productKey);
			return next;
		});

		const query = wasFavorite
			? supabase
					.from('product_favorites')
					.delete()
					.eq('user_id', user.id)
					.eq('product_key', productKey)
			: supabase.from('product_favorites').upsert({
					user_id: user.id,
					product_key: productKey,
				});
		const { error } = await query;

		if (error) {
			setFavoriteKeys(current => {
				const next = new Set(current);
				if (wasFavorite) next.add(productKey);
				else next.delete(productKey);
				return next;
			});
		} else {
			notifyFavoriteChanged(productKey, !wasFavorite);
		}

		setActionPending(productKey, 'favorite', false);
	}

	async function addToOrder(productKey: THomeBestsellerProductKey) {
		if (pendingActions.has(getActionKey(productKey, 'order'))) return;
		if (!(await getAuthenticatedUser())) return;

		setActionPending(productKey, 'order', true);
		const { data, error } = await supabase.rpc('add_home_product_order', {
			p_product_key: productKey,
		});

		if (!error) {
			const order = data as { quantity?: number } | null;
			setCartQuantities(current => {
				const next = new Map(current);
				next.set(productKey, order?.quantity ?? (current.get(productKey) ?? 0) + 1);
				return next;
			});
			setLastOrderedKey(productKey);
			notifyOrderChanged();
			setTimeout(() => {
				setLastOrderedKey(current =>
					current === productKey ? null : current,
				);
			}, 1200);
		}

		setActionPending(productKey, 'order', false);
	}

	async function setOrderQuantity(
		productKey: THomeBestsellerProductKey,
		quantity: number,
	) {
		if (pendingActions.has(getActionKey(productKey, 'order'))) return;
		if (!(await getAuthenticatedUser())) return;

		const previousQuantity = cartQuantities.get(productKey) ?? 0;
		const nextQuantity = Math.max(0, quantity);
		if (nextQuantity === previousQuantity) return;

		setActionPending(productKey, 'order', true);
		setCartQuantities(current => updateCartQuantity(current, productKey, nextQuantity));
		const { error } = await supabase.rpc('set_cart_product_quantity', {
			p_product_key: productKey,
			p_quantity: nextQuantity,
		});

		if (error) {
			setCartQuantities(current => updateCartQuantity(current, productKey, previousQuantity));
		} else notifyOrderChanged();
		setActionPending(productKey, 'order', false);
	}

	return {
		addToOrder,
		cartQuantities,
		favoriteKeys,
		isCartLoading,
		isFavoritesLoading,
		isPending(
			productKey: THomeBestsellerProductKey,
			action: TProductAction,
		) {
			return pendingActions.has(getActionKey(productKey, action));
		},
		lastOrderedKey,
		setOrderQuantity,
		toggleFavorite,
	};
}

function updateCartQuantity(
	quantities: Map<THomeBestsellerProductKey, number>,
	productKey: THomeBestsellerProductKey,
	quantity: number,
) {
	const next = new Map(quantities);
	if (quantity === 0) next.delete(productKey);
	else next.set(productKey, quantity);
	return next;
}
