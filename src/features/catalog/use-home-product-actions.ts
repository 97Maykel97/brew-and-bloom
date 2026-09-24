'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import {
	FAVORITE_CHANGED_EVENT,
	notifyFavoriteChanged,
	type TFavoriteChangedDetail,
} from './favorite-events';
import type { THomeProductKey } from './home-products';
import { notifyOrderChanged, ORDER_CHANGED_EVENT } from './order-modal-events';

type TProductAction = 'favorite' | 'order';

export function useHomeProductActions(locale: string) {
	const router = useRouter();
	const [favoriteKeys, setFavoriteKeys] = useState<Set<THomeProductKey>>(
		new Set(),
	);
	const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);
	const [cartQuantities, setCartQuantities] = useState<Map<THomeProductKey, number>>(new Map());
	const [isCartLoading, setIsCartLoading] = useState(true);
	const [pendingActions, setPendingActions] = useState<Set<string>>(new Set());
	const [lastOrderedKey, setLastOrderedKey] =
		useState<THomeProductKey | null>(null);

	useEffect(() => {
		let isActive = true;

		async function loadCustomerState() {
			const supabase = createClient();
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
				new Set(favoritesResult.data.map(item => item.product_key as THomeProductKey)),
			);
			if (cartResult.data) setCartQuantities(new Map(
				cartResult.data.map(item => [item.product_key as THomeProductKey, item.quantity]),
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
			const supabase = createClient();
			const { data: { user } } = await supabase.auth.getUser();
			if (!user || !isActive) return;
			const { data } = await supabase
				.from('customer_orders')
				.select('product_key, quantity')
				.eq('user_id', user.id)
				.eq('status', 'cart');
			if (!isActive || !data) return;
			setCartQuantities(new Map(
				data.map(item => [item.product_key as THomeProductKey, item.quantity]),
			));
		}

		window.addEventListener(ORDER_CHANGED_EVENT, refreshCart);
		return () => {
			isActive = false;
			window.removeEventListener(ORDER_CHANGED_EVENT, refreshCart);
		};
	}, []);

	useEffect(() => {
		function handleFavoriteChange(event: Event) {
			const { isFavorite, productKey } = (
				event as CustomEvent<TFavoriteChangedDetail>
			).detail;

			setFavoriteKeys(current => {
				const next = new Set(current);
				if (isFavorite) next.add(productKey);
				else next.delete(productKey);
				return next;
			});
		}

		window.addEventListener(FAVORITE_CHANGED_EVENT, handleFavoriteChange);
		return () =>
			window.removeEventListener(FAVORITE_CHANGED_EVENT, handleFavoriteChange);
	}, []);

	function getActionKey(productKey: THomeProductKey, action: TProductAction) {
		return `${action}:${productKey}`;
	}

	function setActionPending(
		productKey: THomeProductKey,
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
		const supabase = createClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			router.push(`/${locale}/auth/login`);
			return null;
		}

		return { supabase, user };
	}

	async function toggleFavorite(productKey: THomeProductKey) {
		const actionKey = getActionKey(productKey, 'favorite');

		if (pendingActions.has(actionKey)) return;

		const context = await getAuthenticatedUser();
		if (!context) return;

		const wasFavorite = favoriteKeys.has(productKey);
		setActionPending(productKey, 'favorite', true);
		setFavoriteKeys(current => {
			const next = new Set(current);
			if (wasFavorite) next.delete(productKey);
			else next.add(productKey);
			return next;
		});

		const query = wasFavorite
			? context.supabase
					.from('product_favorites')
					.delete()
					.eq('user_id', context.user.id)
					.eq('product_key', productKey)
			: context.supabase.from('product_favorites').upsert({
					user_id: context.user.id,
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

	async function addToOrder(productKey: THomeProductKey) {
		const actionKey = getActionKey(productKey, 'order');

		if (pendingActions.has(actionKey)) return;

		const context = await getAuthenticatedUser();
		if (!context) return;

		setActionPending(productKey, 'order', true);
		const { data, error } = await context.supabase.rpc('add_home_product_order', {
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
			window.setTimeout(() => {
				setLastOrderedKey(current =>
					current === productKey ? null : current,
				);
			}, 1200);
		}

		setActionPending(productKey, 'order', false);
	}

	async function setOrderQuantity(productKey: THomeProductKey, quantity: number) {
		if (pendingActions.has(getActionKey(productKey, 'order'))) return;
		const context = await getAuthenticatedUser();
		if (!context) return;

		const previousQuantity = cartQuantities.get(productKey) ?? 0;
		const nextQuantity = Math.max(0, quantity);
		if (nextQuantity === previousQuantity) return;

		setActionPending(productKey, 'order', true);
		setCartQuantities(current => updateCartQuantity(current, productKey, nextQuantity));
		const { error } = await context.supabase.rpc('set_cart_product_quantity', {
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
		isPending(productKey: THomeProductKey, action: TProductAction) {
			return pendingActions.has(getActionKey(productKey, action));
		},
		lastOrderedKey,
		setOrderQuantity,
		toggleFavorite,
	};
}

function updateCartQuantity(
	quantities: Map<THomeProductKey, number>,
	productKey: THomeProductKey,
	quantity: number,
) {
	const next = new Map(quantities);
	if (quantity === 0) next.delete(productKey);
	else next.set(productKey, quantity);
	return next;
}
