import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	LayoutAnimation,
	Pressable,
	Text,
	View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { getHomeProduct } from '@/features/home/home-products';
import type { TLocale } from '@/i18n/languages';
import {
	type THomeBestsellerProductKey,
	translations,
} from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import { notifyFavoriteChanged } from '@/lib/favorite-events';
import type { TProfileTranslations } from '../profileTranslations';
import type { TProfileOrderStatus } from '../types';
import EmptyProfileState from './EmptyProfileState';
import { profileContentStyles as styles } from './profile-content.styles';

type TProfileListProps = {
	activeStatus: TProfileOrderStatus;
	activeTab: 'bookings' | 'favorites' | 'orders';
	copy: TProfileTranslations;
	isRtl: boolean;
	locale: TLocale;
	onStatusChange: (status: TProfileOrderStatus) => void;
};

type TFavoriteRow = {
	created_at: string;
	product_key: THomeBestsellerProductKey;
};

type TOrderRow = {
	id: number;
	order_id: string;
	product_key: THomeBestsellerProductKey;
	quantity: number;
	status: Exclude<TProfileOrderStatus, 'all'>;
	unit_price: number;
	updated_at: string;
};

type TOrderGroup = {
	id: string;
	items: TOrderRow[];
	status: Exclude<TProfileOrderStatus, 'all'>;
	updatedAt: string;
};

const ORDER_COPY = {
	ru: { order: 'Заказ', products: 'товаров', total: 'Итого' },
	en: { order: 'Order', products: 'items', total: 'Total' },
	he: { order: 'הזמנה', products: 'פריטים', total: 'סה״כ' },
} as const;

export default function ProfileList({
	activeStatus,
	activeTab,
	copy,
	isRtl,
	locale,
	onStatusChange,
}: TProfileListProps) {
	const [favorites, setFavorites] = useState<TFavoriteRow[]>([]);
	const [orders, setOrders] = useState<TOrderRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const isOrders = activeTab === 'orders';
	const productCopy = translations[locale].bestsellers.products;
	const groupedOrders = groupOrders(orders);
	const visibleOrders =
		activeStatus === 'all'
			? groupedOrders
			: groupedOrders.filter(order => order.status === activeStatus);

	useEffect(() => {
		let isActive = true;

		async function loadItems(showLoading = false) {
			if (showLoading) setIsLoading(true);

			if (activeTab === 'favorites') {
				const { data } = await supabase
					.from('product_favorites')
					.select('product_key, created_at')
					.order('created_at', { ascending: false });

				if (isActive) setFavorites((data as TFavoriteRow[] | null) ?? []);
			} else if (activeTab === 'orders') {
				const { data } = await supabase
					.from('customer_orders')
					.select('id, order_id, product_key, quantity, status, unit_price, updated_at')
					.neq('status', 'cart')
					.order('updated_at', { ascending: false });

				if (isActive) setOrders((data as TOrderRow[] | null) ?? []);
			}

			if (isActive) setIsLoading(false);
		}

		void loadItems(true);
		const channel = activeTab === 'orders'
			? supabase
				.channel(`profile-orders-${Date.now()}`)
				.on(
					'postgres_changes',
					{ event: '*', schema: 'public', table: 'customer_orders' },
					() => void loadItems(false),
				)
				.subscribe()
			: null;
		return () => {
			isActive = false;
			if (channel) void supabase.removeChannel(channel);
		};
	}, [activeTab]);

	async function removeFavorite(productKey: THomeBestsellerProductKey) {
		const previous = favorites;
		setFavorites(current =>
			current.filter(item => item.product_key !== productKey),
		);

		const { error } = await supabase
			.from('product_favorites')
			.delete()
			.eq('product_key', productKey);

		if (error) setFavorites(previous);
		else notifyFavoriteChanged(productKey, false);
	}

	return (
		<View style={styles.list}>
			{isOrders ? (
				<OrderStatuses
					activeStatus={activeStatus}
					copy={copy}
					onStatusChange={onStatusChange}
				/>
			) : null}

			{isLoading ? (
				<View style={styles.productLoading}>
					<ActivityIndicator color={Colors.accent} />
				</View>
			) : activeTab === 'favorites' && favorites.length > 0 ? (
				<View style={styles.productList}>
					{favorites.map(item => {
						const product = getHomeProduct(item.product_key);
						if (!product) return null;

						return (
							<ProductRow
								description={productCopy[item.product_key].description}
								isRtl={isRtl}
								key={item.product_key}
								name={productCopy[item.product_key].name}
								onRemove={() => void removeFavorite(item.product_key)}
								price={product.price}
								productImage={product.image}
							/>
						);
					})}
				</View>
			) : isOrders && visibleOrders.length > 0 ? (
				<View style={styles.productList}>
					{visibleOrders.map(order => {
						return (
							<OrderCard
								copy={copy}
								isRtl={isRtl}
								key={order.id}
								locale={locale}
								order={order}
							/>
						);
					})}
				</View>
			) : (
				<EmptyProfileState
					description={
						isOrders ? copy.emptyOrdersText : copy.emptyFavoritesText
					}
					icon={isOrders ? 'shopping-bag' : 'heart'}
					isRtl={isRtl}
					title={isOrders ? copy.emptyOrders : copy.emptyFavorites}
				/>
			)}
		</View>
	);
}

function groupOrders(rows: TOrderRow[]) {
	const groups = new Map<string, TOrderGroup>();
	for (const row of rows) {
		const group = groups.get(row.order_id);
		if (group) {
			group.items.push(row);
			if (row.updated_at > group.updatedAt) group.updatedAt = row.updated_at;
		} else {
			groups.set(row.order_id, {
				id: row.order_id,
				items: [row],
				status: row.status,
				updatedAt: row.updated_at,
			});
		}
	}
	return [...groups.values()].sort((a, b) => Number(['completed', 'cancelled'].includes(a.status)) - Number(['completed', 'cancelled'].includes(b.status)) || b.updatedAt.localeCompare(a.updatedAt));
}

function OrderCard({
	copy,
	isRtl,
	locale,
	order,
}: {
	copy: TProfileTranslations;
	isRtl: boolean;
	locale: TLocale;
	order: TOrderGroup;
}) {
	const [isOpen, setIsOpen] = useState(order.status !== 'completed' && order.status !== 'cancelled');
	const [isCancelling, setIsCancelling] = useState(false);
	const [cancelError, setCancelError] = useState('');
	const labels = ORDER_COPY[locale];
	const productCopy = translations[locale].bestsellers.products;
	const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
	const total = order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
	const dateLocale = locale === 'he' ? 'he-IL' : locale === 'ru' ? 'ru-RU' : 'en-US';
	const statuses = ['processing', 'preparing', 'ready', 'completed'] as const;
	const statusLabels = {
		processing: copy.processingOrders,
		preparing: copy.preparingOrders,
		ready: copy.readyOrders,
		completed: copy.completedOrders,
		cancelled: copy.cancelledOrders,
	};
	const activeStep = statuses.indexOf(order.status as (typeof statuses)[number]);
	const isCompleted = order.status === 'completed';
	const isCancelled = order.status === 'cancelled';

	function confirmCancellation() {
		if (isCancelling || order.status !== 'processing') return;
		Alert.alert(copy.cancelOrder, copy.cancelOrderConfirm, [
			{ text: copy.cancel, style: 'cancel' },
			{ text: copy.cancelOrder, style: 'destructive', onPress: () => void cancelOrder() },
		]);
	}

	async function cancelOrder() {
		setIsCancelling(true);
		setCancelError('');
		const { error } = await supabase.rpc('cancel_customer_order', { p_order_id: order.id });
		if (error) setCancelError(copy.cancelOrderError);
		setIsCancelling(false);
	}

	function toggleOrder() {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setIsOpen(current => !current);
	}

	return (
		<View style={[styles.orderCard, (isCompleted || isCancelled) && styles.completedOrderCard]}>
			<Pressable
				accessibilityRole='button'
				accessibilityState={{ expanded: isOpen }}
				onPress={toggleOrder}
				style={({ pressed }) => [
					styles.orderHeader,
					isRtl && styles.rowRtl,
					pressed && styles.pressed,
				]}
			>
				<View style={styles.orderHeadingCopy}>
					<Text style={[styles.orderNumber, isRtl && styles.rtlText]}>{labels.order} #{order.id.slice(0, 8).toUpperCase()}</Text>
					<Text style={[styles.orderDate, isRtl && styles.rtlText]}>{new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.updatedAt))}</Text>
				</View>
				<View style={[styles.orderHeaderActions, isRtl && styles.rowRtl]}>
					<Text style={[styles.orderStatus, order.status === 'processing' ? styles.processingOrderStatus : order.status === 'preparing' ? styles.preparingOrderStatus : order.status === 'ready' ? styles.readyOrderStatus : order.status === 'cancelled' ? styles.cancelledOrderStatus : styles.completedOrderStatus]}>{statusLabels[order.status]}</Text>
					<View style={styles.orderChevron}><Feather name='chevron-down' size={17} color={Colors.muted} style={isOpen ? styles.orderChevronOpen : undefined} /></View>
				</View>
			</Pressable>

			{isOpen ? <>
			{!isCancelled ? <View style={[styles.orderProgress, isRtl && styles.rowRtl]}>
				{statuses.map((status, index) => {
					const isReached = index <= activeStep;
					return <View key={status} style={styles.orderStep}>
						{index > 0 ? <View style={[styles.orderStepLine, index <= activeStep && styles.orderStepLineActive]} /> : null}
						<View style={[styles.orderStepDot, isReached && styles.orderStepDotActive]}>{index < activeStep || isCompleted ? <Feather name='check' size={11} color={Colors.white} /> : <Text style={[styles.orderStepNumber, isReached && styles.orderStepNumberActive]}>{index + 1}</Text>}</View>
						<Text numberOfLines={1} style={[styles.orderStepLabel, isReached && styles.orderStepLabelActive]}>{statusLabels[status]}</Text>
					</View>;
				})}
			</View> : null}

			<View style={styles.orderItems}>
				{order.items.map(item => {
					const product = getHomeProduct(item.product_key);
					if (!product) return null;
					return <View key={item.id} style={[styles.orderItem, isRtl && styles.rowRtl]}>
						<Image contentFit='cover' source={product.image} style={styles.orderItemImage} />
						<View style={styles.orderItemCopy}><Text numberOfLines={1} style={[styles.orderItemName, isRtl && styles.rtlText]}>{productCopy[item.product_key].name}</Text><Text style={[styles.orderItemQuantity, isRtl && styles.rtlText]}>× {item.quantity}</Text></View>
						<Text style={styles.orderItemPrice}>{item.unit_price * item.quantity} ₪</Text>
					</View>;
				})}
			</View>

			<View style={[styles.orderFooter, isRtl && styles.rowRtl]}>
				<Text style={styles.orderItemCount}>{itemCount} {labels.products}</Text>
				<Text style={styles.orderTotal}>{labels.total}: {total} ₪</Text>
			</View>
			{order.status === 'processing' ? <Pressable disabled={isCancelling} onPress={confirmCancellation} style={({ pressed }) => [styles.cancelOrderButton, (pressed || isCancelling) && styles.pressed]}><Feather name='x-circle' size={15} color='#A64338' /><Text style={styles.cancelOrderText}>{isCancelling ? copy.cancellingOrder : copy.cancelOrder}</Text></Pressable> : null}
			{cancelError ? <Text style={styles.cancelOrderError}>{cancelError}</Text> : null}
			</> : null}
		</View>
	);
}

type TProductRowProps = {
	description: string;
	isRtl: boolean;
	name: string;
	onRemove?: () => void;
	price: number;
	productImage: number;
	quantity?: number;
	statusLabel?: string;
};

function ProductRow({
	description,
	isRtl,
	name,
	onRemove,
	price,
	productImage,
	quantity,
	statusLabel,
}: TProductRowProps) {
	return (
		<View style={[styles.productRow, isRtl && styles.rowRtl]}>
			<Image contentFit='cover' source={productImage} style={styles.productImage} />
			<View style={styles.productRowContent}>
				<View style={[styles.productRowHeader, isRtl && styles.rowRtl]}>
					<View style={styles.productRowCopy}>
						<Text
							numberOfLines={1}
							style={[styles.productRowName, isRtl && styles.rtlText]}
						>
							{name}
						</Text>
						<Text
							numberOfLines={2}
							style={[styles.productRowDescription, isRtl && styles.rtlText]}
						>
							{description}
						</Text>
					</View>
					{onRemove ? (
						<Pressable
							onPress={onRemove}
							style={({ pressed }) => [
								styles.removeFavorite,
								pressed && styles.pressed,
							]}
						>
							<Feather name='heart' size={17} color='#A65345' />
						</Pressable>
					) : null}
				</View>
				<View style={[styles.productRowFooter, isRtl && styles.rowRtl]}>
					<Text style={styles.productRowPrice}>
						{price} ₪{quantity && quantity > 1 ? ` × ${quantity}` : ''}
					</Text>
					{statusLabel ? (
						<Text style={styles.orderStatus}>{statusLabel}</Text>
					) : null}
				</View>
			</View>
		</View>
	);
}

type TOrderStatusesProps = {
	activeStatus: TProfileOrderStatus;
	copy: TProfileTranslations;
	onStatusChange: (status: TProfileOrderStatus) => void;
};

function OrderStatuses({
	activeStatus,
	copy,
	onStatusChange,
}: TOrderStatusesProps) {
	const statuses: {
		key: TProfileOrderStatus;
		label: string;
	}[] = [
		{ key: 'all', label: copy.allOrders },
		{ key: 'processing', label: copy.processingOrders },
		{ key: 'preparing', label: copy.preparingOrders },
		{ key: 'ready', label: copy.readyOrders },
		{ key: 'completed', label: copy.completedOrders },
		{ key: 'cancelled', label: copy.cancelledOrders },
	];

	return (
		<View style={styles.statuses}>
			{statuses.map(status => (
				<Pressable
					key={status.key}
					onPress={() => onStatusChange(status.key)}
					style={({ pressed }) => [
						styles.status,
						activeStatus === status.key && styles.activeStatus,
						pressed && styles.pressed,
					]}
				>
					<Text style={styles.statusText}>{status.label}</Text>
				</Pressable>
			))}
		</View>
	);
}
