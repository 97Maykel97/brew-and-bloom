import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import { eventTranslations } from '@/features/events/event-translations';
import { formatEventDate } from '@/features/events/event-utils';
import type { TEventRegistrationStatus, TEventType } from '@/features/events/types';
import type { TLocale } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';

type TRegistration = {
	registration_id: string;
	event_id: string;
	guest_count: number;
	status: TEventRegistrationStatus;
	title_ru: string;
	title_en: string;
	title_he: string;
	event_type: TEventType;
	event_date: string;
	start_time: string;
	end_time: string;
};

const COPY = {
	ru: { title: 'Мои события', upcoming: 'Предстоящие', history: 'История', empty: 'Вы пока не записаны на события', choose: 'Посмотреть события' },
	en: { title: 'My events', upcoming: 'Upcoming', history: 'History', empty: 'You have not registered for any events yet', choose: 'Explore events' },
	he: { title: 'האירועים שלי', upcoming: 'אירועים קרובים', history: 'היסטוריה', empty: 'עדיין לא נרשמת לאירועים', choose: 'לצפייה באירועים' },
} as const;

export default function EventRegistrationsView({ isRtl, locale }: { isRtl: boolean; locale: TLocale }) {
	const copy = COPY[locale];
	const eventCopy = eventTranslations[locale];
	const [registrations, setRegistrations] = useState<TRegistration[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [error, setError] = useState('');

	const loadRegistrations = useCallback(async () => {
		const { data, error: loadError } = await supabase.rpc('get_my_event_registrations');
		if (!loadError) setRegistrations((data as TRegistration[] | null) ?? []);
		else setError(eventCopy.error);
		setIsLoading(false);
	}, [eventCopy.error]);

	useEffect(() => {
		const initialLoadTimer = setTimeout(() => void loadRegistrations(), 0);
		const channel = supabase
			.channel(`mobile-profile-events-${Date.now()}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => void loadRegistrations())
			.subscribe();
		return () => {
			clearTimeout(initialLoadTimer);
			void supabase.removeChannel(channel);
		};
	}, [loadRegistrations]);

	const groups = useMemo(() => ({
		upcoming: registrations.filter(item => item.status !== 'cancelled' && isUpcoming(item)),
		history: registrations.filter(item => item.status === 'cancelled' || !isUpcoming(item)),
	}), [registrations]);

	function confirmCancellation(registration: TRegistration) {
		Alert.alert(eventCopy.cancel, eventCopy.cancelConfirm, [
			{ text: eventCopy.close, style: 'cancel' },
			{ text: eventCopy.cancel, style: 'destructive', onPress: () => void cancelRegistration(registration) },
		]);
	}

	async function cancelRegistration(registration: TRegistration) {
		setPendingId(registration.registration_id);
		setError('');
		const { error: cancelError } = await supabase.rpc('cancel_event_registration', {
			p_registration_id: registration.registration_id,
		});
		setPendingId(null);
		if (cancelError) setError(eventCopy.error);
		else await loadRegistrations();
	}

	if (isLoading) {
		return <View style={styles.loading}><ActivityIndicator color={Colors.accent} /></View>;
	}

	if (registrations.length === 0) {
		return (
			<View style={styles.empty}>
				<View style={styles.icon}><Feather color={Colors.accent} name='calendar' size={24} /></View>
				<Text style={[styles.emptyTitle, isRtl && styles.rtl]}>{copy.empty}</Text>
				<Pressable onPress={() => router.navigate({ pathname: '/events', params: { locale } })} style={styles.primaryButton}>
					<Text style={styles.primaryButtonText}>{copy.choose}</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={[styles.heading, isRtl && styles.rowRtl]}>
				<View style={styles.icon}><Feather color={Colors.accent} name='calendar' size={22} /></View>
				<Text style={[styles.title, isRtl && styles.rtl]}>{copy.title}</Text>
			</View>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			<RegistrationGroup isRtl={isRtl} items={groups.upcoming} label={copy.upcoming} locale={locale} onCancel={confirmCancellation} pendingId={pendingId} />
			{groups.history.length > 0 ? <RegistrationGroup isRtl={isRtl} items={groups.history} label={copy.history} locale={locale} onCancel={confirmCancellation} pendingId={pendingId} /> : null}
		</View>
	);
}

function RegistrationGroup({ isRtl, items, label, locale, onCancel, pendingId }: { isRtl: boolean; items: TRegistration[]; label: string; locale: TLocale; onCancel: (item: TRegistration) => void; pendingId: string | null }) {
	if (items.length === 0) return null;
	const copy = eventTranslations[locale];
	return (
		<View style={styles.group}>
			<Text style={[styles.groupTitle, isRtl && styles.rtl]}>{label}</Text>
			{items.map(item => (
				<View key={item.registration_id} style={styles.card}>
					<View style={[styles.cardHeader, isRtl && styles.rowRtl]}>
						<View style={styles.cardCopy}>
							<Text style={[styles.type, isRtl && styles.rtl]}>{copy.types[item.event_type]}</Text>
							<Text style={[styles.cardTitle, isRtl && styles.rtl]}>{item[`title_${locale}`] || item.title_ru}</Text>
						</View>
						<Text style={[styles.status, statusStyle(item.status)]}>{copy.statuses[item.status]}</Text>
					</View>
					<View style={styles.meta}>
						<Meta icon='calendar' value={formatEventDate(item.event_date, locale)} />
						<Meta icon='clock' value={`${item.start_time.slice(0, 5)}–${item.end_time.slice(0, 5)}`} />
						<Meta icon='users' value={String(item.guest_count)} />
					</View>
					{item.status !== 'cancelled' && isUpcoming(item) ? (
						<Pressable disabled={pendingId === item.registration_id} onPress={() => onCancel(item)} style={styles.cancelButton}>
							<Text style={styles.cancelText}>{pendingId === item.registration_id ? copy.cancelling : copy.cancel}</Text>
						</Pressable>
					) : null}
				</View>
			))}
		</View>
	);
}

function Meta({ icon, value }: { icon: 'calendar' | 'clock' | 'users'; value: string }) {
	return <View style={styles.metaItem}><Feather color={Colors.muted} name={icon} size={13} /><Text style={styles.metaText}>{value}</Text></View>;
}

function isUpcoming(item: TRegistration) {
	const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jerusalem' }).replace(' ', 'T').slice(0, 16);
	return `${item.event_date}T${item.end_time}` > now;
}

function statusStyle(status: TEventRegistrationStatus) {
	return status === 'confirmed' ? styles.confirmed : status === 'cancelled' ? styles.cancelled : styles.pending;
}

const styles = StyleSheet.create({
	container: { marginTop: Spacing.medium, gap: 14 },
	heading: { minHeight: 72, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#E2D5C8', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)' },
	icon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#EFE3D6' },
	title: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 19, fontWeight: '700' },
	group: { gap: 10 },
	groupTitle: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 15, fontWeight: '700' },
	card: { padding: 15, borderWidth: 1, borderColor: '#E2D5C8', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.76)' },
	cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
	cardCopy: { minWidth: 0, flex: 1 },
	type: { color: '#8A6D5A', fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
	cardTitle: { marginTop: 5, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700' },
	status: { overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, fontFamily: Fonts.sans, fontSize: 9, fontWeight: '700' },
	pending: { color: '#8A621B', backgroundColor: '#FFF1D7' },
	confirmed: { color: '#526C48', backgroundColor: '#E7F0E2' },
	cancelled: { color: '#9A433D', backgroundColor: '#F7E3DF' },
	meta: { marginTop: 12, gap: 7 },
	metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
	metaText: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 12 },
	cancelButton: { minHeight: 40, marginTop: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#EAC3BD', borderRadius: 999, backgroundColor: '#FFF4F1' },
	cancelText: { color: '#AD493F', fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700' },
	loading: { minHeight: 220, alignItems: 'center', justifyContent: 'center' },
	empty: { minHeight: 240, marginTop: Spacing.medium, padding: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: '#D8C8BA', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.55)' },
	emptyTitle: { marginTop: 12, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 16, fontWeight: '700', textAlign: 'center' },
	primaryButton: { minHeight: 44, marginTop: 18, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: Colors.accent },
	primaryButtonText: { color: Colors.white, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '700' },
	error: { padding: 10, color: '#AD493F', fontFamily: Fonts.sans, fontSize: 12, textAlign: 'center' },
	rtl: { textAlign: 'right', writingDirection: 'rtl' },
	rowRtl: { flexDirection: 'row-reverse' },
});
