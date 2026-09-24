import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { createElement, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { ActivityIndicator, Alert, LayoutAnimation, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import { getHomeProduct } from '@/features/home/home-products';
import { formatPhoneNumber } from '@/features/profile/lib/profile-formatters';
import {
	translations,
	type TLocale,
} from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import {
	countStatuses,
	filterOrdersByCustomer,
	filterOrdersByDate,
	formatOrderCount,
	formatOrderDateShort,
	formatOrderDay,
	getOrderDayKey,
	getPickerDateKey,
	getRecentOrderDays,
	groupOrders,
	groupOrdersByDay,
	type TOrderFilter,
	type TOrderGroup,
	type TOrderRow,
	type TOrderStatus,
	type TProfileRow,
} from '../order-utils';


const COPY = {
	ru: { action: { preparing: 'Начать готовить', ready: 'Готов к выдаче', completed: 'Завершить', cancel: 'Отменить', cancelConfirm: 'Отменить этот заказ? Товары вернутся в остатки.', back: 'Вернуть назад' }, all: 'Всего', allDates: 'Все даты', customer: 'Клиент', dateOrders: 'Заказы за 7 дней', empty: 'Оформленных заказов пока нет', error: 'Не удалось обновить заказ.', items: 'товаров', noResults: 'Заказы по выбранным фильтрам не найдены', order: 'Заказ', phone: 'Телефон', search: 'Найти клиента по имени', status: { processing: 'В обработке', preparing: 'Готовится', ready: 'Готов к выдаче', completed: 'Завершён', cancelled: 'Отменён' }, title: 'Заказы', today: 'Сегодня', total: 'Итого', unknown: 'Пользователь', yesterday: 'Вчера' },
	en: { action: { preparing: 'Start preparing', ready: 'Ready for pickup', completed: 'Complete', cancel: 'Cancel', cancelConfirm: 'Cancel this order? The products will be returned to stock.', back: 'Move back' }, all: 'Total', allDates: 'All dates', customer: 'Customer', dateOrders: 'Orders for 7 days', empty: 'There are no placed orders yet', error: 'Could not update the order.', items: 'items', noResults: 'No orders match the selected filters', order: 'Order', phone: 'Phone', search: 'Search customer by name', status: { processing: 'Processing', preparing: 'Preparing', ready: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled' }, title: 'Orders', today: 'Today', total: 'Total', unknown: 'Customer', yesterday: 'Yesterday' },
	he: { action: { preparing: 'התחלת הכנה', ready: 'מוכן לאיסוף', completed: 'השלמה', cancel: 'ביטול', cancelConfirm: 'לבטל את ההזמנה? המוצרים יוחזרו למלאי.', back: 'החזרה אחורה' }, all: 'סה״כ', allDates: 'כל התאריכים', customer: 'לקוח', dateOrders: 'הזמנות ל-7 ימים', empty: 'אין עדיין הזמנות שבוצעו', error: 'לא ניתן לעדכן את ההזמנה.', items: 'פריטים', noResults: 'לא נמצאו הזמנות לפי המסננים שנבחרו', order: 'הזמנה', phone: 'טלפון', search: 'חיפוש לקוח לפי שם', status: { processing: 'בטיפול', preparing: 'בהכנה', ready: 'מוכן לאיסוף', completed: 'הושלם', cancelled: 'בוטל' }, title: 'הזמנות', today: 'היום', total: 'סה״כ', unknown: 'לקוח', yesterday: 'אתמול' },
} as const;

export default function AdminOrders({ isRtl, locale }: { isRtl: boolean; locale: TLocale }) {
	const copy = COPY[locale];
	const productCopy = translations[locale].bestsellers.products;
	const [orders, setOrders] = useState<TOrderRow[]>([]);
	const [profiles, setProfiles] = useState<Map<string, TProfileRow>>(new Map());
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
	const [activeFilter, setActiveFilter] = useState<TOrderFilter>('all');
	const [customerQuery, setCustomerQuery] = useState('');
	const [selectedDate, setSelectedDate] = useState('');
	const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
	const [isDateListOpen, setIsDateListOpen] = useState(false);
	const [openOrderIds, setOpenOrderIds] = useState<Set<string>>(new Set());
	const initializedOpenOrders = useRef(false);
	const groupedOrders = groupOrders(orders);
	const dateSummaries = getRecentOrderDays(groupedOrders, 7);
	const dateFilteredOrders = filterOrdersByDate(groupedOrders, selectedDate);
	const statusCounts = countStatuses(dateFilteredOrders);
	const statusFilteredOrders = activeFilter === 'all' ? dateFilteredOrders : dateFilteredOrders.filter(order => order.status === activeFilter);
	const visibleOrders = filterOrdersByCustomer(statusFilteredOrders, profiles, customerQuery);
	const orderDays = groupOrdersByDay(visibleOrders);

	useEffect(() => {
		let isActive = true;
		async function loadOrders() {
			const { data, error: ordersError } = await supabase.from('customer_orders').select('id, order_id, user_id, product_key, quantity, unit_price, status, updated_at').neq('status', 'cart').order('updated_at', { ascending: false });
			if (!isActive) return;
			if (ordersError) { setError(copy.error); setIsLoading(false); return; }
			const rows = (data as TOrderRow[] | null) ?? [];
			setOrders(rows);
			if (!initializedOpenOrders.current) {
				setOpenOrderIds(new Set(groupOrders(rows).filter(order => !['completed', 'cancelled'].includes(order.status)).map(order => order.id)));
				initializedOpenOrders.current = true;
			}
			const userIds = [...new Set(rows.map(row => row.user_id))];
			if (userIds.length > 0) {
				const { data: profileData } = await supabase.from('profiles').select('id, first_name, last_name, phone').in('id', userIds);
				if (isActive) setProfiles(new Map(((profileData as TProfileRow[] | null) ?? []).map(profile => [profile.id, profile])));
			}
			if (isActive) setIsLoading(false);
		}
		void loadOrders();
		const channel = supabase
			.channel(`admin-orders-${Date.now()}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'customer_orders' }, () => void loadOrders())
			.subscribe();
		return () => { isActive = false; void supabase.removeChannel(channel); };
	}, [copy.error]);

	async function changeStatus(order: TOrderGroup, status: TOrderStatus) {
		if (pendingOrderId || order.status === status) return;
		const previous = orders;
		setPendingOrderId(order.id);
		setOrders(current => current.map(item => item.order_id === order.id ? { ...item, status } : item));
		const { error: updateError } = await supabase.rpc('admin_set_customer_order_status', { p_order_id: order.id, p_status: status });
		if (updateError) { setOrders(previous); setError(copy.error); }
		setPendingOrderId(null);
	}

	function toggleOrder(orderId: string) {
		LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
		setOpenOrderIds(current => {
			const next = new Set(current);
			if (next.has(orderId)) next.delete(orderId);
			else next.add(orderId);
			return next;
		});
	}

	if (isLoading) return <View style={styles.loading}><ActivityIndicator color={Colors.accent} /></View>;

	return <View style={styles.section}>
		<View style={styles.counterPanel}>
			<Pressable onPress={() => setActiveFilter('all')} style={({ pressed }) => [styles.sectionHeading, isRtl && styles.rtlRow, pressed && styles.pressed]}><View style={styles.headingIcon}><Feather name='shopping-bag' size={20} color={Colors.white} /></View><Text style={[styles.title, isRtl && styles.rtlText]}>{copy.title}</Text></Pressable>
			<View style={[styles.statusCounters, isRtl && styles.rtlRow]}><StatusCounter active={activeFilter === 'processing'} count={statusCounts.processing} label={copy.status.processing} onPress={() => setActiveFilter('processing')} tone='processing' /><StatusCounter active={activeFilter === 'preparing'} count={statusCounts.preparing} label={copy.status.preparing} onPress={() => setActiveFilter('preparing')} tone='preparing' /><StatusCounter active={activeFilter === 'ready'} count={statusCounts.ready} label={copy.status.ready} onPress={() => setActiveFilter('ready')} tone='ready' /><StatusCounter active={activeFilter === 'completed'} count={statusCounts.completed} label={copy.status.completed} onPress={() => setActiveFilter('completed')} tone='completed' /><StatusCounter active={activeFilter === 'cancelled'} count={statusCounts.cancelled} label={copy.status.cancelled} onPress={() => setActiveFilter('cancelled')} tone='cancelled' /></View>
		</View>
		<View style={[styles.searchBox, isRtl && styles.rtlRow]}>
			<Feather name='search' size={18} color={Colors.muted} />
			<TextInput autoCapitalize='words' autoCorrect={false} clearButtonMode='while-editing' onChangeText={setCustomerQuery} placeholder={copy.search} placeholderTextColor={Colors.muted} style={[styles.searchInput, isRtl && styles.rtlText]} value={customerQuery} />
			{customerQuery && Platform.OS !== 'ios' ? <Pressable accessibilityLabel='Clear search' hitSlop={8} onPress={() => setCustomerQuery('')}><Feather name='x' size={17} color={Colors.muted} /></Pressable> : null}
		</View>
		{Platform.OS === 'web' ? createElement('input', {
			type: 'date',
			'aria-label': copy.allDates,
			max: getOrderDayKey(new Date()),
			value: selectedDate,
			onChange: (event: ChangeEvent<HTMLInputElement>) => setSelectedDate(event.target.value),
			style: webDateInputStyle,
		}) : <View style={styles.dateFilterWrap}>
			<Pressable accessibilityLabel={copy.allDates} onPress={() => setIsDatePickerOpen(true)} style={({ pressed }) => [styles.dateFilter, isRtl && styles.rtlRow, pressed && styles.pressed]}><Feather name='calendar' size={17} color={Colors.muted} /><Text numberOfLines={1} style={[styles.dateFilterText, isRtl && styles.rtlText]}>{selectedDate ? formatOrderDay(selectedDate, locale, copy.today, copy.yesterday) : copy.allDates}</Text>{selectedDate ? <Pressable accessibilityLabel={copy.allDates} hitSlop={8} onPress={event => { event.stopPropagation(); setSelectedDate(''); }}><Feather name='x' size={17} color={Colors.muted} /></Pressable> : <Feather name='chevron-down' size={16} color={Colors.muted} />}</Pressable>
		</View>}
		{Platform.OS === 'android' && isDatePickerOpen ? <DateTimePicker maximumDate={new Date()} mode='date' onChange={(_, date) => { setIsDatePickerOpen(false); if (date) setSelectedDate(getPickerDateKey(date)); }} value={selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date()} /> : null}
		{Platform.OS === 'ios' ? <Modal animationType='fade' onRequestClose={() => setIsDatePickerOpen(false)} transparent visible={isDatePickerOpen}><Pressable onPress={() => setIsDatePickerOpen(false)} style={styles.pickerBackdrop}><Pressable onPress={event => event.stopPropagation()} style={styles.pickerCard}><DateTimePicker accentColor={Colors.accent} display='spinner' maximumDate={new Date()} mode='date' onChange={(_, date) => { if (date) setSelectedDate(getPickerDateKey(date)); }} textColor={Colors.foreground} themeVariant='light' value={selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date()} /><Pressable onPress={() => setIsDatePickerOpen(false)} style={styles.pickerDone}><Feather name='check' size={19} color={Colors.white} /></Pressable></Pressable></Pressable></Modal> : null}
		{dateSummaries.length > 0 ? <Pressable accessibilityState={{ expanded: isDateListOpen }} onPress={() => setIsDateListOpen(true)} style={({ pressed }) => [styles.dateListButton, isRtl && styles.rtlRow, pressed && styles.pressed]}><Text style={[styles.dateListButtonText, isRtl && styles.rtlText]}>{copy.dateOrders}</Text><Feather name='chevron-down' size={17} color={Colors.muted} /></Pressable> : null}
		<Modal animationType='fade' onRequestClose={() => setIsDateListOpen(false)} transparent visible={isDateListOpen}><Pressable onPress={() => setIsDateListOpen(false)} style={styles.pickerBackdrop}><Pressable onPress={event => event.stopPropagation()} style={styles.dateListCard}><View style={[styles.dateListHeader, isRtl && styles.rtlRow]}><Text style={[styles.dateListTitle, isRtl && styles.rtlText]}>{copy.dateOrders}</Text><Pressable onPress={() => setIsDateListOpen(false)}><Feather name='x' size={20} color={Colors.muted} /></Pressable></View><ScrollView contentContainerStyle={styles.dateListContent} showsVerticalScrollIndicator={false}><Pressable onPress={() => { setSelectedDate(''); setIsDateListOpen(false); }} style={[styles.dateListItem, isRtl && styles.rtlRow, !selectedDate && styles.dateListItemActive]}><Text style={[styles.dateListItemDate, !selectedDate && styles.dateListItemTextActive]}>{copy.allDates}</Text><Text style={[styles.dateListItemCount, !selectedDate && styles.dateListItemTextActive]}>{formatOrderCount(groupedOrders.length, locale)}</Text></Pressable>{dateSummaries.map(day => { const isSelected = selectedDate === day.key; return <Pressable key={day.key} onPress={() => { setSelectedDate(day.key); setIsDateListOpen(false); }} style={[styles.dateListItem, isRtl && styles.rtlRow, isSelected && styles.dateListItemActive]}><Text style={[styles.dateListItemDate, isSelected && styles.dateListItemTextActive]}>{formatOrderDateShort(day.key, locale)}</Text><Text style={[styles.dateListItemCount, isSelected && styles.dateListItemTextActive]}>{formatOrderCount(day.orders.length, locale)}</Text></Pressable>; })}</ScrollView></Pressable></Pressable></Modal>
		{error ? <Text style={styles.error}>{error}</Text> : null}
		{visibleOrders.length === 0 ? <View style={styles.empty}><Feather name='package' size={28} color={Colors.muted} /><Text style={[styles.emptyText, isRtl && styles.rtlText]}>{customerQuery.trim() || selectedDate || activeFilter !== 'all' ? copy.noResults : copy.empty}</Text></View> : <View style={styles.dayList}>{orderDays.map(day => <View style={styles.daySection} key={day.key}>
			<View style={[styles.dayHeader, isRtl && styles.rtlRow]}><View style={styles.dayLine} /><View style={[styles.dayLabel, isRtl && styles.rtlRow]}><Text style={[styles.dayTitle, isRtl && styles.rtlText]}>{formatOrderDay(day.key, locale, copy.today, copy.yesterday)}</Text><View style={styles.dayCount}><Text style={styles.dayCountText}>{formatOrderCount(day.orders.length, locale)}</Text></View></View><View style={styles.dayLine} /></View>
			<View style={styles.list}>{day.orders.map(order => {
			const profile = profiles.get(order.userId);
			const customerName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || copy.unknown;
			const total = order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
			const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
			const isTerminal = order.status === 'completed' || order.status === 'cancelled';
			const isOpen = openOrderIds.has(order.id);
			const nextStatus = order.status === 'processing' ? 'preparing' : order.status === 'preparing' ? 'ready' : order.status === 'ready' ? 'completed' : null;
			const previousStatus = order.status === 'preparing' ? 'processing' : order.status === 'ready' ? 'preparing' : null;
			const canCancel = !isTerminal;
			return <View style={[styles.card, isTerminal && styles.completedCard]} key={order.id}>
				<Pressable accessibilityRole='button' accessibilityState={{ expanded: isOpen }} onPress={() => toggleOrder(order.id)} style={({ pressed }) => [styles.cardHeader, pressed && styles.headerPressed]}>
					<View style={[styles.headerTop, isRtl && styles.rtlRow]}>
						<View style={styles.headerColumn}><View style={[styles.orderNumberRow, isRtl && styles.rtlRow]}>{order.status === 'completed' ? <Feather name='check-circle' size={15} color='#64805A' /> : null}<Text style={[styles.orderNumber, isRtl && styles.rtlText]}>{copy.order} #{order.id.slice(0, 8).toUpperCase()}</Text></View><Text style={[styles.date, isRtl && styles.rtlText]}>{new Intl.DateTimeFormat(locale === 'he' ? 'he-IL' : locale === 'ru' ? 'ru-RU' : 'en-US', { timeStyle: 'short' }).format(new Date(order.updatedAt))}</Text></View>
						<View style={[styles.headerActions, isRtl && styles.rtlRow]}><View style={[styles.statusPill, styles[`${order.status}Pill`]]}><Text style={[styles.statusPillText, styles[`${order.status}PillText`]]}>{copy.status[order.status]}</Text></View><View style={styles.chevronButton}><Feather name='chevron-down' size={17} color={Colors.muted} style={isOpen ? styles.chevronOpen : undefined} /></View></View>
					</View>
					<View style={[styles.customerRow, isRtl && styles.rtlRow]}><Text numberOfLines={1} style={[styles.customer, isRtl && styles.rtlText]}>{copy.customer}: {customerName}</Text>{profile?.phone ? <Text style={[styles.phone, styles.ltrText]}>{formatPhoneNumber(profile.phone)}</Text> : null}</View>
				</Pressable>
				{isOpen ? <>
					<View style={styles.items}>{order.items.map(item => { const product = getHomeProduct(item.product_key); if (!product) return null; return <View style={[styles.item, isRtl && styles.rtlRow]} key={item.id}><Image contentFit='cover' source={product.image} style={styles.image} /><View style={styles.itemCopy}><Text numberOfLines={1} style={[styles.itemName, isRtl && styles.rtlText]}>{productCopy[item.product_key].name}</Text><Text style={[styles.quantity, isRtl && styles.rtlText]}>× {item.quantity}</Text></View><Text style={styles.price}>{item.unit_price * item.quantity} ₪</Text></View>; })}</View>
					<View style={[styles.summary, isRtl && styles.rtlRow]}><Text style={styles.itemCount}>{itemCount} {copy.items}</Text><Text style={styles.total}>{copy.total}: {total} ₪</Text></View>
					<View style={[styles.workflowActions, isRtl && styles.rtlRow]}>
						{canCancel ? <Pressable disabled={pendingOrderId === order.id} onPress={() => Alert.alert(copy.action.cancel, copy.action.cancelConfirm, [{ text: copy.action.back, style: 'cancel' }, { text: copy.action.cancel, style: 'destructive', onPress: () => void changeStatus(order, 'cancelled') }])} style={({ pressed }) => [styles.cancelAction, (pressed || pendingOrderId === order.id) && styles.pressed]}><Text style={styles.cancelActionText}>{copy.action.cancel}</Text></Pressable> : null}
						{previousStatus ? <Pressable disabled={pendingOrderId === order.id} onPress={() => void changeStatus(order, previousStatus)} style={({ pressed }) => [styles.secondaryAction, (pressed || pendingOrderId === order.id) && styles.pressed]}><Feather name='rotate-ccw' size={14} color={Colors.foreground} /><Text style={styles.secondaryActionText}>{copy.action.back}</Text></Pressable> : null}
						{nextStatus ? <Pressable disabled={pendingOrderId === order.id} onPress={() => void changeStatus(order, nextStatus)} style={({ pressed }) => [styles.primaryAction, (pressed || pendingOrderId === order.id) && styles.pressed]}><Text style={styles.primaryActionText}>{copy.action[nextStatus]}</Text><Feather name={isRtl ? 'arrow-left' : 'arrow-right'} size={15} color={Colors.white} /></Pressable> : <View style={[styles.completedBadge, order.status === 'cancelled' && styles.cancelledBadge]}><Feather name={order.status === 'cancelled' ? 'x-circle' : 'check-circle'} size={15} color={order.status === 'cancelled' ? '#9A433D' : '#526C48'} /><Text style={[styles.completedBadgeText, order.status === 'cancelled' && styles.cancelledBadgeText]}>{copy.status[order.status]}</Text></View>}
					</View>
				</> : null}
			</View>;
			})}</View>
		</View>)}</View>}
	</View>;
}

function StatusCounter({ active, count, label, onPress, tone }: { active: boolean; count: number; label: string; onPress: () => void; tone: TOrderStatus }) {
	return <Pressable accessibilityState={{ selected: active }} onPress={onPress} style={({ pressed }) => [styles.statusCounter, styles[`${tone}Counter`], active && styles.activeCounter, pressed && styles.pressed]}><Text style={[styles.statusCounterValue, styles[`${tone}CounterText`]]}>{count}</Text><Text numberOfLines={1} style={[styles.statusCounterLabel, styles[`${tone}CounterText`]]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
	section: { gap: Spacing.medium },
	loading: { minHeight: 300, alignItems: 'center', justifyContent: 'center' },
	counterPanel: { padding: 14, gap: 14, borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.7)' },
	sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 11 },
	headingIcon: { position: 'relative', width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: Colors.accent },
	title: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 22, fontWeight: '700' },
	count: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 12 },
	statusCounters: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
	searchBox: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.82)' },
	searchInput: { minWidth: 0, flex: 1, paddingVertical: 10, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13 },
	dateFilterWrap: { position: 'relative' },
	dateFilter: { minHeight: 48, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.82)' },
	dateFilterText: { minWidth: 0, flex: 1, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13 },
	pickerBackdrop: { flex: 1, padding: Spacing.large, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(33,22,15,0.48)' },
	pickerCard: { width: '100%', maxWidth: 380, padding: Spacing.medium, borderRadius: 24, backgroundColor: Colors.background },
	pickerDone: { width: 46, height: 46, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: Colors.accent },
	dateListButton: { minHeight: 44, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.82)' },
	dateListButtonText: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700' },
	dateListCard: { width: '100%', maxWidth: 390, maxHeight: '72%', padding: Spacing.medium, borderRadius: 24, backgroundColor: Colors.background },
	dateListHeader: { paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#DFD2C5' },
	dateListTitle: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 18, fontWeight: '800' },
	dateListContent: { paddingTop: 8, gap: 5 },
	dateListItem: { minHeight: 46, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, borderRadius: 13 },
	dateListItemActive: { backgroundColor: Colors.accent },
	dateListItemDate: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700' },
	dateListItemCount: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 10 },
	dateListItemTextActive: { color: Colors.white },
	activeCounter: { borderWidth: 2, borderColor: Colors.accent },
	statusCounter: { minWidth: 0, flexBasis: '30%', flexGrow: 1, paddingHorizontal: 7, paddingVertical: 9, alignItems: 'center', borderRadius: 12 },
	processingCounter: { backgroundColor: '#FFF2D9' }, preparingCounter: { backgroundColor: '#F6E6D4' }, readyCounter: { backgroundColor: '#E7F0E2' }, completedCounter: { backgroundColor: '#ECE8E4' }, cancelledCounter: { backgroundColor: '#F7E3DF' },
	statusCounterValue: { fontFamily: Fonts.sans, fontSize: 16, fontWeight: '800' },
	statusCounterLabel: { marginTop: 2, fontFamily: Fonts.sans, fontSize: 9, fontWeight: '600' },
	processingCounterText: { color: '#8A621B' }, preparingCounterText: { color: '#8A5528' }, readyCounterText: { color: '#526C48' }, completedCounterText: { color: '#675E58' }, cancelledCounterText: { color: '#9A433D' },
	error: { padding: 12, color: '#B33A3A', fontFamily: Fonts.sans, fontSize: 12, borderRadius: 12, backgroundColor: '#FFF0EF' },
	empty: { minHeight: 260, alignItems: 'center', justifyContent: 'center', gap: 12, borderWidth: 1, borderColor: '#E4D8CD', borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.75)' },
	emptyText: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '600', textAlign: 'center' },
	dayList: { gap: 24 },
	daySection: { gap: 11 },
	dayHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	dayLine: { height: StyleSheet.hairlineWidth, flex: 1, backgroundColor: '#DFD2C5' },
	dayLabel: { paddingHorizontal: 11, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 18, backgroundColor: Colors.background },
	dayTitle: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700' },
	dayCount: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, backgroundColor: Colors.accent },
	dayCountText: { color: Colors.white, fontFamily: Fonts.sans, fontSize: 8, fontWeight: '800' },
	list: { gap: 12 },
	card: { overflow: 'hidden', borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.82)' },
	completedCard: { borderColor: '#D8D2CC', backgroundColor: 'rgba(244,241,238,0.85)' },
	cardHeader: { padding: 13, gap: 10, backgroundColor: '#EFE4D8' },
	headerPressed: { backgroundColor: '#E9DACB' },
	headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
	headerColumn: { minWidth: 0, flex: 1, gap: 3 },
	headerActions: { flexDirection: 'row', alignItems: 'center', gap: 7 },
	statusPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 },
	statusPillText: { fontFamily: Fonts.sans, fontSize: 9, fontWeight: '700' },
	processingPill: { backgroundColor: '#FFF2D9' },
	preparingPill: { backgroundColor: '#F6E6D4' },
	readyPill: { backgroundColor: '#E7F0E2' },
	completedPill: { backgroundColor: '#ECE8E4' },
	cancelledPill: { backgroundColor: '#F7E3DF' },
	processingPillText: { color: '#8A621B' },
	preparingPillText: { color: '#8A5528' },
	readyPillText: { color: '#526C48' },
	completedPillText: { color: '#675E58' },
	cancelledPillText: { color: '#9A433D' },
	chevronButton: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.65)' },
	chevronOpen: { transform: [{ rotate: '180deg' }] },
	customerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
	orderNumberRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
	orderNumber: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '800' },
	date: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 9 },
	customer: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700' },
	phone: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 9 },
	ltrText: { textAlign: 'left', writingDirection: 'ltr' },
	items: { paddingHorizontal: 13 },
	item: { minHeight: 68, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#EADFD5' },
	image: { width: 56, height: 50, borderRadius: 9 },
	itemCopy: { minWidth: 0, flex: 1, gap: 3 },
	itemName: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700' },
	quantity: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 10 },
	price: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 11, fontWeight: '800', writingDirection: 'ltr' },
	summary: { padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
	itemCount: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 10 },
	total: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '800', writingDirection: 'ltr' },
	workflowActions: { padding: 11, paddingTop: 0, flexDirection: 'row', justifyContent: 'flex-end', gap: 7 },
	secondaryAction: { minHeight: 38, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#D8CABD', borderRadius: 20, backgroundColor: Colors.white },
	secondaryActionText: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700' },
	cancelAction: { minHeight: 38, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E6BDB5', borderRadius: 20, backgroundColor: '#FFF5F2' },
	cancelActionText: { color: '#A64338', fontFamily: Fonts.sans, fontSize: 10, fontWeight: '800' },
	primaryAction: { minHeight: 38, flex: 1, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 20, backgroundColor: Colors.accent },
	primaryActionText: { color: Colors.white, fontFamily: Fonts.sans, fontSize: 10, fontWeight: '800' },
	completedBadge: { minHeight: 38, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 20, backgroundColor: '#E7F0E2' },
	completedBadgeText: { color: '#526C48', fontFamily: Fonts.sans, fontSize: 10, fontWeight: '800' },
	cancelledBadge: { backgroundColor: '#F7E3DF' },
	cancelledBadgeText: { color: '#9A433D' },
	rtlRow: { flexDirection: 'row-reverse' }, rtlText: { textAlign: 'right', writingDirection: 'rtl' }, pressed: { opacity: 0.6 },
});

const webDateInputStyle = {
	width: '100%',
	height: 48,
	padding: '0 14px',
	border: '1px solid #DFD2C5',
	borderRadius: 16,
	backgroundColor: 'rgba(255,255,255,0.82)',
	color: '#2B211B',
	fontFamily: 'system-ui',
	fontSize: 13,
	boxSizing: 'border-box' as const,
};
