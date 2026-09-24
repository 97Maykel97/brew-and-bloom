import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { TLocale } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import type { TAdminSection, TAdminTranslation } from '../types';
import { adminOverviewStyles as styles } from './admin-overview.styles';

type TAdminOverviewProps = { copy: TAdminTranslation; isRtl: boolean; locale: TLocale; onSectionChange: (section: TAdminSection) => void };
type TOrderStatus = 'processing' | 'preparing' | 'ready' | 'completed' | 'cancelled';
type TOrderRow = { order_id: string; quantity: number; status: TOrderStatus; updated_at: string; user_id: string };
type TActivityOrder = { id: string; itemCount: number; customerName: string; status: TOrderStatus; updatedAt: string };

const STATUS_COPY: Record<TLocale, Record<TOrderStatus, string>> = {
	ru: { processing: 'В обработке', preparing: 'Готовится', ready: 'Готов к выдаче', completed: 'Завершён', cancelled: 'Отменён' },
	en: { processing: 'Processing', preparing: 'Preparing', ready: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled' },
	he: { processing: 'בטיפול', preparing: 'בהכנה', ready: 'מוכן לאיסוף', completed: 'הושלם', cancelled: 'בוטל' },
};

const ACTIVITY_COPY = {
	ru: { customer: 'Клиент', items: 'товаров', order: 'Заказ' },
	en: { customer: 'Customer', items: 'items', order: 'Order' },
	he: { customer: 'לקוח', items: 'פריטים', order: 'הזמנה' },
} as const;

export default function AdminOverview({ copy, isRtl, locale, onSectionChange }: TAdminOverviewProps) {
	const [orders, setOrders] = useState<TActivityOrder[]>([]);
	const [counts, setCounts] = useState({ orders: 0, bookings: 0, users: 0, menuItems: 0 });
	const [isLoading, setIsLoading] = useState(true);
	const labels = ACTIVITY_COPY[locale];

	const loadOverview = useCallback(async () => {
		const [ordersResult, profilesResult, menuResult] = await Promise.all([
			supabase.from('customer_orders').select('order_id, user_id, quantity, status, updated_at').neq('status', 'cart').order('updated_at', { ascending: false }),
			supabase.from('profiles').select('id, first_name, last_name'),
			supabase.from('menu_products').select('id', { count: 'exact', head: true }),
		]);
		const rows = (ordersResult.data as TOrderRow[] | null) ?? [];
		const profiles = new Map((profilesResult.data ?? []).map(profile => [profile.id, [profile.first_name, profile.last_name].filter(Boolean).join(' ')]));
		const grouped = groupOrders(rows, profiles, copy.administrator);
		setOrders(grouped.slice(0, 6));
		setCounts({ orders: grouped.filter(order => ['processing', 'preparing', 'ready'].includes(order.status)).length, bookings: 0, users: profilesResult.data?.length ?? 0, menuItems: menuResult.count ?? 0 });
		setIsLoading(false);
	}, [copy.administrator]);

	useEffect(() => {
		const initialLoadTimer = setTimeout(() => void loadOverview(), 0);
		const channel = supabase
			.channel(`mobile-admin-overview-${Date.now()}-${Math.random().toString(36).slice(2)}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'customer_orders' }, () => void loadOverview())
			.on('postgres_changes', { event: '*', schema: 'public', table: 'menu_products' }, () => void loadOverview())
			.on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => void loadOverview())
			.subscribe();
		return () => {
			clearTimeout(initialLoadTimer);
			void supabase.removeChannel(channel);
		};
	}, [loadOverview]);

	const statistics = [
		{ key: 'orders' as const, label: copy.overview.orders, icon: 'shopping-bag' as const, section: 'orders' as const },
		{ key: 'bookings' as const, label: copy.overview.bookings, icon: 'calendar' as const, section: 'bookings' as const },
		{ key: 'users' as const, label: copy.overview.users, icon: 'users' as const, section: 'users' as const },
		{ key: 'menuItems' as const, label: copy.overview.menuItems, icon: 'coffee' as const, section: 'menu' as const },
	];

	return <View style={styles.wrapper}>
		<View style={[styles.statistics, isRtl && styles.rtlRow]}>{statistics.map(item => <Pressable key={item.key} onPress={() => onSectionChange(item.section)} style={({ pressed }) => [styles.statCard, pressed && styles.pressed]}><View style={styles.iconCircle}><Feather name={item.icon} size={18} color={Colors.accent} /></View>{isLoading ? <ActivityIndicator color={Colors.accent} size='small' style={styles.valueLoader} /> : <Text style={[styles.value, isRtl && styles.rtlText]}>{counts[item.key]}</Text>}<Text style={[styles.statLabel, isRtl && styles.rtlText]}>{item.label}</Text></Pressable>)}</View>

		<View style={styles.activityCard}>
			<View style={[styles.activityHeading, isRtl && styles.rtlRow]}><Text style={[styles.activityTitle, isRtl && styles.rtlText]}>{copy.overview.recentActivity}</Text>{orders.length > 0 ? <Pressable onPress={() => onSectionChange('orders')} style={({ pressed }) => [styles.allActivity, isRtl && styles.rtlRow, pressed && styles.pressed]}><Text style={styles.allActivityText}>{copy.navigation.orders}</Text><Feather name={isRtl ? 'chevron-left' : 'chevron-right'} size={15} color={Colors.accent} /></Pressable> : null}</View>
			{isLoading ? <View style={styles.loadingActivity}><ActivityIndicator color={Colors.accent} /></View> : orders.length === 0 ? <View style={styles.emptyActivity}><View style={styles.emptyIcon}><Feather name='inbox' size={22} color={Colors.accent} /></View><Text style={[styles.emptyText, isRtl && styles.rtlText]}>{copy.overview.emptyActivity}</Text></View> : <View style={styles.activityList}>{orders.map(order => <Pressable key={order.id} onPress={() => onSectionChange('orders')} style={({ pressed }) => [styles.activityRow, isRtl && styles.rtlRow, pressed && styles.pressed]}><View style={styles.orderIcon}><Feather name='shopping-bag' size={16} color={Colors.accent} /></View><View style={styles.activityCopy}><Text numberOfLines={1} style={[styles.orderTitle, isRtl && styles.rtlText]}>{labels.order} #{order.id.slice(0, 8).toUpperCase()}</Text><Text numberOfLines={1} style={[styles.orderMeta, isRtl && styles.rtlText]}>{labels.customer}: {order.customerName} · {order.itemCount} {labels.items}</Text></View><View style={styles.activityStatus}><Text style={[styles.statusPill, getStatusStyle(order.status)]}>{STATUS_COPY[locale][order.status]}</Text><Text style={styles.activityTime}>{formatActivityDate(order.updatedAt, locale)}</Text></View></Pressable>)}</View>}
		</View>
	</View>;
}

function groupOrders(rows: TOrderRow[], profiles: Map<string, string>, fallbackName: string): TActivityOrder[] {
	const groups = new Map<string, TActivityOrder>();
	for (const row of rows) {
		const current = groups.get(row.order_id);
		if (current) current.itemCount += row.quantity;
		else groups.set(row.order_id, { id: row.order_id, itemCount: row.quantity, customerName: profiles.get(row.user_id) || fallbackName, status: row.status, updatedAt: row.updated_at });
	}
	return [...groups.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

function formatActivityDate(value: string, locale: TLocale) {
	return new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

function getStatusStyle(status: TOrderStatus) {
	if (status === 'processing') return styles.processingStatus;
	if (status === 'preparing') return styles.preparingStatus;
	if (status === 'ready') return styles.readyStatus;
	if (status === 'cancelled') return styles.cancelledStatus;
	return styles.completedStatus;
}
