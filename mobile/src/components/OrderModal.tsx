import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getHomeProduct } from '@/features/home/home-products';
import { useMenuProductInventory } from '@/features/home/use-menu-product-inventory';
import type { THomeBestsellerProductKey, TLocale } from '@/i18n/translations';
import { translations } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import { notifyOrderChanged } from '@/lib/order-modal-events';

type TOrderModalProps = {
	locale: TLocale;
	onClose: () => void;
	onCartChange: (itemCount: number) => void;
	visible: boolean;
};
type TOrderRow = {
	id: number;
	product_key: THomeBestsellerProductKey;
	quantity: number;
	unit_price: number;
	updated_at: string;
};

async function fetchCartOrders() {
	const { data } = await supabase
		.from('customer_orders')
		.select('id, product_key, quantity, unit_price, updated_at')
		.eq('status', 'cart')
		.order('updated_at', { ascending: false });

	return (data as TOrderRow[] | null) ?? [];
}

const MODAL_COPY = {
	ru: {
		checkout: 'Оформить заказ', checkoutError: 'Не удалось оформить заказ. Попробуйте ещё раз.',
		decrease: 'Уменьшить количество', increase: 'Увеличить количество', remove: 'Удалить товар',
		close: 'Закрыть', empty: 'Корзина пуста', emptyText: 'Нажмите «+» у товара, чтобы добавить его в корзину.',
		title: 'Текущий заказ', total: 'Итого', successTitle: 'Ваш заказ принят', successText: 'Мы уже передали его в обработку. Следить за статусом можно в личном кабинете.', trackOrder: 'Отследить заказ', continueShopping: 'Продолжить покупки',
	},
	en: {
		checkout: 'Place order', checkoutError: 'Could not place the order. Please try again.',
		decrease: 'Decrease quantity', increase: 'Increase quantity', remove: 'Remove product',
		close: 'Close', empty: 'Your cart is empty', emptyText: 'Tap “+” on a product to add it to your cart.',
		title: 'Current order', total: 'Total', successTitle: 'Your order has been accepted', successText: 'It is now being processed. You can track its status in your account.', trackOrder: 'Track order', continueShopping: 'Continue shopping',
	},
	he: {
		checkout: 'ביצוע הזמנה', checkoutError: 'לא ניתן לבצע את ההזמנה. נסו שוב.',
		decrease: 'הפחתת כמות', increase: 'הגדלת כמות', remove: 'הסרת מוצר',
		close: 'סגירה', empty: 'הסל ריק', emptyText: 'לחצו על "+" ליד מוצר כדי להוסיף אותו לסל.',
		title: 'הזמנה נוכחית', total: 'סה״כ', successTitle: 'ההזמנה התקבלה', successText: 'ההזמנה הועברה לטיפול. ניתן לעקוב אחר הסטטוס באזור האישי.', trackOrder: 'מעקב אחר ההזמנה', continueShopping: 'המשך קנייה',
	},
} as const;

export default function OrderModal({ locale, onCartChange, onClose, visible }: TOrderModalProps) {
	const insets = useSafeAreaInsets();
	const copy = MODAL_COPY[locale];
	const productCopy = translations[locale].bestsellers.products;
	const isRtl = locale === 'he';
	const { inventory } = useMenuProductInventory();
	const [orders, setOrders] = useState<TOrderRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [isCheckoutComplete, setIsCheckoutComplete] = useState(false);
	const [checkoutError, setCheckoutError] = useState('');
	const [pendingProductKeys, setPendingProductKeys] = useState<Set<THomeBestsellerProductKey>>(new Set());
	const quantityTimers = useRef<Map<THomeBestsellerProductKey, ReturnType<typeof setTimeout>>>(new Map());
	const quantityRequests = useRef<Map<THomeBestsellerProductKey, Promise<void>>>(new Map());
	const total = orders.reduce((sum, order) => sum + order.unit_price * order.quantity, 0);

	useEffect(() => {
		if (!visible) return;
		let isActive = true;
		async function loadCart() {
			const data = await fetchCartOrders();
			if (!isActive) return;
			setOrders(data);
			setIsLoading(false);
		}
		void loadCart();
		return () => { isActive = false; };
	}, [visible]);

	useEffect(() => {
		const timers = quantityTimers.current;
		return () => timers.forEach(timer => clearTimeout(timer));
	}, []);

	async function checkout() {
		if (isCheckingOut || orders.length === 0) return;
		setIsCheckingOut(true);
		setCheckoutError('');
		const { error } = await supabase.rpc('checkout_current_order');
		if (error) {
			setCheckoutError(copy.checkoutError);
			setIsCheckingOut(false);
			return;
		}

		setOrders([]);
		setIsCheckingOut(false);
		onCartChange(0);
		setIsCheckoutComplete(true);
		notifyOrderChanged();
	}

	function closeModal() {
		setIsCheckoutComplete(false);
		onClose();
	}

	function openOrders() {
		setIsCheckoutComplete(false);
		onClose();
		router.navigate({ pathname: '/profile', params: { locale, tab: 'orders' } });
	}

	function setQuantity(order: TOrderRow, nextQuantity: number) {
		const productInventory = inventory.get(order.product_key);
		if (nextQuantity > order.quantity && (
			!productInventory?.isActive || nextQuantity > productInventory.stockQuantity
		)) return;

		const nextOrders = nextQuantity <= 0
			? orders.filter(item => item.id !== order.id)
			: orders.map(item => item.id === order.id ? { ...item, quantity: nextQuantity } : item);
		setPendingProductKeys(current => new Set(current).add(order.product_key));
		setOrders(nextOrders);
		onCartChange(nextOrders.reduce((sum, item) => sum + item.quantity, 0));

		const previousTimer = quantityTimers.current.get(order.product_key);
		if (previousTimer) clearTimeout(previousTimer);
		const timer = setTimeout(async () => {
			let hasError = false;
			const previousRequest = quantityRequests.current.get(order.product_key);
			const request = (previousRequest ?? Promise.resolve()).catch(() => undefined).then(async () => {
				const { error } = await supabase.rpc('set_cart_product_quantity', {
					p_product_key: order.product_key,
					p_quantity: nextQuantity,
				});
				hasError = Boolean(error);
			}).catch(() => { hasError = true; });
			quantityRequests.current.set(order.product_key, request);
			await request;
			if (quantityTimers.current.get(order.product_key) !== timer) return;
			if (hasError) {
				const restoredOrders = await fetchCartOrders();
				setOrders(restoredOrders);
				onCartChange(restoredOrders.reduce((sum, item) => sum + item.quantity, 0));
			} else notifyOrderChanged();
			quantityTimers.current.delete(order.product_key);
			quantityRequests.current.delete(order.product_key);
			setPendingProductKeys(current => {
				const next = new Set(current);
				next.delete(order.product_key);
				return next;
			});
		}, 220);
		quantityTimers.current.set(order.product_key, timer);
	}

	return (
		<Modal animationType='slide' onRequestClose={closeModal} statusBarTranslucent transparent visible={visible}>
			<Pressable accessibilityRole='button' onPress={closeModal} style={styles.backdrop}>
				<Pressable onPress={event => event.stopPropagation()} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
					<View style={styles.handle} />
					<View style={[styles.header, isRtl && styles.rtlRow]}>
						<View style={[styles.titleGroup, isRtl && styles.rtlRow]}><View style={styles.titleIcon}><Feather name='shopping-bag' size={19} color={Colors.accent} /></View><Text style={[styles.title, isRtl && styles.rtlText]}>{copy.title}</Text></View>
						<Pressable accessibilityLabel={copy.close} onPress={closeModal} style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}><Feather name='x' size={21} color={Colors.muted} /></Pressable>
					</View>

					{isCheckoutComplete ? <OrderSuccess copy={copy} isRtl={isRtl} onClose={closeModal} onTrack={openOrders} /> : isLoading ? <View style={styles.loading}><ActivityIndicator color={Colors.accent} /></View> : orders.length === 0 ? (
						<View style={styles.empty}><View style={styles.emptyIcon}><Feather name='shopping-bag' size={24} color={Colors.accent} /></View><Text style={[styles.emptyTitle, isRtl && styles.rtlText]}>{copy.empty}</Text><Text style={[styles.emptyText, isRtl && styles.rtlText]}>{copy.emptyText}</Text></View>
					) : <>
						<ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>{orders.map(order => {
							const product = getHomeProduct(order.product_key);
							if (!product) return null;
							const itemCopy = productCopy[order.product_key];
							const productInventory = inventory.get(order.product_key);
							const isAtStockLimit = !productInventory?.isActive || order.quantity >= productInventory.stockQuantity;
							return <View key={order.id} style={[styles.item, isRtl && styles.rtlRow]}>
								<Image contentFit='cover' source={product.image} style={styles.itemImage} />
								<View style={styles.itemCopy}>
									<View style={[styles.itemHeading, isRtl && styles.rtlRow]}><Text numberOfLines={1} style={[styles.itemName, isRtl && styles.rtlText]}>{itemCopy.name}</Text><Text style={styles.itemPrice}>{order.unit_price * order.quantity} ₪</Text></View>
									<View style={[styles.itemActions, isRtl && styles.rtlRow]}>
										<View style={[styles.quantityControl, isRtl && styles.rtlRow]}>
											<Pressable accessibilityLabel={copy.decrease} onPress={() => setQuantity(order, order.quantity - 1)} style={({ pressed }) => [styles.quantityButton, pressed && styles.pressed]}><Feather name='minus' size={14} color={Colors.foreground} /></Pressable>
											<CartQuantityInput
												label={`${itemCopy.name}: quantity`}
												maxQuantity={productInventory?.stockQuantity}
												onQuantityChange={nextQuantity => setQuantity(order, nextQuantity)}
												quantity={order.quantity}
												style={styles.quantityInput}
											/>
											<Pressable accessibilityLabel={copy.increase} disabled={isAtStockLimit} onPress={() => setQuantity(order, order.quantity + 1)} style={({ pressed }) => [styles.quantityButton, isAtStockLimit && styles.quantityButtonDisabled, pressed && styles.pressed]}><Feather name='plus' size={14} color={Colors.foreground} /></Pressable>
										</View>
										<Pressable accessibilityLabel={`${copy.remove}: ${itemCopy.name}`} onPress={() => setQuantity(order, 0)} style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}><Feather name='trash-2' size={15} color='#A65345' /></Pressable>
									</View>
								</View>
							</View>;
						})}</ScrollView>
						<View style={styles.footer}>
							<View style={[styles.totalRow, isRtl && styles.rtlRow]}><Text style={styles.totalLabel}>{copy.total}</Text><Text style={styles.totalValue}>{total} ₪</Text></View>
							{checkoutError ? <Text style={styles.errorText}>{checkoutError}</Text> : null}
							<Pressable disabled={isCheckingOut || pendingProductKeys.size > 0} onPress={() => void checkout()} style={({ pressed }) => [styles.checkoutButton, (pressed || isCheckingOut || pendingProductKeys.size > 0) && styles.pressed]}>{isCheckingOut ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.checkoutButtonText}>{copy.checkout}</Text>}</Pressable>
						</View>
					</>}
				</Pressable>
			</Pressable>
		</Modal>
	);
}

function OrderSuccess({ copy, isRtl, onClose, onTrack }: { copy: (typeof MODAL_COPY)[TLocale]; isRtl: boolean; onClose: () => void; onTrack: () => void }) {
	return <View style={styles.success}>
		<View style={styles.successIcon}><View style={styles.successIconRing} /><Feather name='check' size={36} color='#5F7755' /></View>
		<Text style={[styles.successTitle, isRtl && styles.rtlText]}>{copy.successTitle}</Text>
		<Text style={[styles.successText, isRtl && styles.rtlText]}>{copy.successText}</Text>
		<Pressable onPress={onTrack} style={({ pressed }) => [styles.trackButton, isRtl && styles.rtlRow, pressed && styles.pressed]}><Text style={styles.trackButtonText}>{copy.trackOrder}</Text><Feather name={isRtl ? 'arrow-left' : 'arrow-right'} size={17} color={Colors.white} /></Pressable>
		<Pressable onPress={onClose} style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}><Text style={styles.continueButtonText}>{copy.continueShopping}</Text></Pressable>
	</View>;
}

function CartQuantityInput({
	label,
	maxQuantity,
	onQuantityChange,
	quantity,
	style,
}: {
	label: string;
	maxQuantity?: number;
	onQuantityChange: (quantity: number) => void;
	quantity: number;
	style: object;
}) {
	const [draftValue, setDraftValue] = useState<string | null>(null);
	const value = draftValue ?? String(quantity);

	function changeValue(rawValue: string) {
		const digits = rawValue.replace(/\D/g, '');
		setDraftValue(digits);
		if (!digits) return;

		const requestedQuantity = Number.parseInt(digits, 10);
		const nextQuantity = Math.min(
			Math.max(requestedQuantity, 0),
			maxQuantity ?? requestedQuantity,
		);
		setDraftValue(String(nextQuantity));
		if (nextQuantity !== quantity) onQuantityChange(nextQuantity);
	}

	return (
		<TextInput
			accessibilityLabel={label}
			inputMode='numeric'
			keyboardType='number-pad'
			maxLength={7}
			onBlur={() => setDraftValue(null)}
			onChangeText={changeValue}
			selectTextOnFocus
			style={style}
			value={value}
		/>
	);
}

const styles = StyleSheet.create({
	backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(33,22,15,0.48)' },
	sheet: { maxHeight: '84%', paddingHorizontal: Spacing.medium, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: '#F8F3EC' },
	handle: { width: 42, height: 4, marginTop: 10, alignSelf: 'center', borderRadius: 2, backgroundColor: '#D7C9BC' },
	header: { paddingVertical: Spacing.medium, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E4D8CC' },
	titleGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
	titleIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: '#EFE1D5' },
	title: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 20, fontWeight: '700' },
	closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20, backgroundColor: 'rgba(74,50,36,0.05)' },
	loading: { minHeight: 230, alignItems: 'center', justifyContent: 'center' },
	empty: { minHeight: 250, paddingHorizontal: Spacing.large, alignItems: 'center', justifyContent: 'center' },
	emptyIcon: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: '#EFE1D5' },
	emptyTitle: { marginTop: Spacing.medium, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 17, fontWeight: '700', textAlign: 'center' },
	emptyText: { maxWidth: 300, marginTop: Spacing.small, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19, textAlign: 'center' },
	success: { minHeight: 340, paddingHorizontal: Spacing.medium, paddingVertical: Spacing.xLarge, alignItems: 'center', justifyContent: 'center' },
	successIcon: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center', borderRadius: 40, backgroundColor: '#E4EEE0', shadowColor: '#526C48', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 5 },
	successIconRing: { position: 'absolute', inset: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.85)', borderRadius: 32 },
	successTitle: { marginTop: 22, color: Colors.foreground, fontFamily: Fonts.serif, fontSize: 25, fontWeight: '600', textAlign: 'center' },
	successText: { maxWidth: 330, marginTop: 10, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 13, lineHeight: 20, textAlign: 'center' },
	trackButton: { width: '100%', minHeight: 48, marginTop: 26, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 24, backgroundColor: Colors.accent },
	trackButtonText: { color: Colors.white, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
	continueButton: { minHeight: 42, marginTop: 5, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 21 },
	continueButtonText: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '600' },
	list: { paddingVertical: Spacing.medium, gap: Spacing.small },
	item: { padding: 10, flexDirection: 'row', alignItems: 'center', gap: 11, borderWidth: 1, borderColor: '#E5DCD3', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.76)' },
	itemImage: { width: 88, height: 72, borderRadius: 11, backgroundColor: '#EFE4D7' },
	itemCopy: { minWidth: 0, flex: 1, gap: 5 },
	itemHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
	itemName: { minWidth: 0, flex: 1, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
	itemActions: { marginTop: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
	quantityControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DDCFC2', borderRadius: 18, backgroundColor: '#F8F3EC' },
	quantityButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15 },
	quantityButtonDisabled: { opacity: 0.3 },
	quantityInput: { width: 36, height: 30, padding: 0, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700', textAlign: 'center' },
	removeButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#F3E4DC' },
	itemPrice: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '800', writingDirection: 'ltr' },
	footer: { paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E4D8CC', gap: 12 },
	totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	totalLabel: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700' },
	totalValue: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 16, fontWeight: '800', writingDirection: 'ltr' },
	errorText: { color: '#B33A3A', fontFamily: Fonts.sans, fontSize: 12, textAlign: 'center' },
	checkoutButton: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: Colors.accent },
	checkoutButtonText: { color: Colors.white, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' },
	rtlRow: { flexDirection: 'row-reverse' },
	rtlText: { textAlign: 'right', writingDirection: 'rtl' },
	pressed: { opacity: 0.65 },
});
