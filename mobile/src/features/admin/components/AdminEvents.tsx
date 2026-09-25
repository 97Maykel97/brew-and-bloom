import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import { formatEventDate } from '@/features/events/event-utils';
import type { TEventRegistrationStatus, TEventType } from '@/features/events/types';
import type { TLocale } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';

type TAdminEvent = {
	id: string;
	event_type: TEventType;
	title_ru: string;
	title_en: string;
	title_he: string;
	event_date: string;
	start_time: string;
	end_time: string;
	capacity: number;
	is_published: boolean;
};

type TRegistration = {
	id: string;
	event_id: string;
	user_id: string;
	guest_count: number;
	status: TEventRegistrationStatus;
};

type TProfile = { id: string; first_name: string | null; last_name: string | null; phone: string | null };

const COPY = {
	ru: { title: 'События', subtitle: 'Участники и свободные места', participants: 'Участники', empty: 'Событий пока нет', noParticipants: 'Записей пока нет', guests: 'гостей', confirm: 'Подтвердить', cancel: 'Отменить', error: 'Не удалось обновить запись.', statuses: { pending: 'Ожидает', confirmed: 'Подтверждено', cancelled: 'Отменено' } },
	en: { title: 'Events', subtitle: 'Participants and available places', participants: 'Participants', empty: 'No events yet', noParticipants: 'No registrations yet', guests: 'guests', confirm: 'Confirm', cancel: 'Cancel', error: 'Could not update the registration.', statuses: { pending: 'Pending', confirmed: 'Confirmed', cancelled: 'Cancelled' } },
	he: { title: 'אירועים', subtitle: 'משתתפים ומקומות פנויים', participants: 'משתתפים', empty: 'אין עדיין אירועים', noParticipants: 'אין עדיין הרשמות', guests: 'אורחים', confirm: 'אישור', cancel: 'ביטול', error: 'לא ניתן לעדכן את ההרשמה.', statuses: { pending: 'ממתין', confirmed: 'מאושר', cancelled: 'בוטל' } },
} as const;

export default function AdminEvents({ isRtl, locale }: { isRtl: boolean; locale: TLocale }) {
	const copy = COPY[locale];
	const [events, setEvents] = useState<TAdminEvent[]>([]);
	const [registrations, setRegistrations] = useState<TRegistration[]>([]);
	const [profiles, setProfiles] = useState<Map<string, TProfile>>(new Map());
	const [openId, setOpenId] = useState<string | null>(null);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	const loadData = useCallback(async () => {
		const [eventResult, registrationResult, profileResult] = await Promise.all([
			supabase.from('events').select('id, event_type, title_ru, title_en, title_he, event_date, start_time, end_time, capacity, is_published').order('event_date'),
			supabase.from('event_registrations').select('id, event_id, user_id, guest_count, status').order('created_at'),
			supabase.from('profiles').select('id, first_name, last_name, phone'),
		]);
		if (!eventResult.error) setEvents((eventResult.data as TAdminEvent[] | null) ?? []);
		if (!registrationResult.error) setRegistrations((registrationResult.data as TRegistration[] | null) ?? []);
		if (!profileResult.error) setProfiles(new Map(((profileResult.data as TProfile[] | null) ?? []).map(profile => [profile.id, profile])));
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const timer = setTimeout(() => void loadData(), 0);
		const channel = supabase
			.channel(`mobile-admin-events-${Date.now()}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => void loadData())
			.on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => void loadData())
			.subscribe();
		return () => { clearTimeout(timer); void supabase.removeChannel(channel); };
	}, [loadData]);

	async function changeStatus(id: string, status: 'confirmed' | 'cancelled') {
		setPendingId(id);
		setError('');
		const { error: updateError } = await supabase.rpc('admin_set_event_registration_status', { p_registration_id: id, p_status: status });
		setPendingId(null);
		if (updateError) setError(copy.error);
		else await loadData();
	}

	if (isLoading) return <View style={styles.loading}><ActivityIndicator color={Colors.accent} /></View>;

	return (
		<View style={styles.container}>
			<View style={[styles.heading, isRtl && styles.rowRtl]}><View style={styles.headingIcon}><Feather color={Colors.white} name='calendar' size={20} /></View><View><Text style={[styles.title, isRtl && styles.rtl]}>{copy.title}</Text><Text style={[styles.subtitle, isRtl && styles.rtl]}>{copy.subtitle}</Text></View></View>
			{error ? <Text style={styles.error}>{error}</Text> : null}
			{events.length === 0 ? <Text style={styles.empty}>{copy.empty}</Text> : events.map(event => {
				const eventRegistrations = registrations.filter(item => item.event_id === event.id);
				const activeGuests = eventRegistrations.filter(item => item.status !== 'cancelled').reduce((sum, item) => sum + item.guest_count, 0);
				const isOpen = openId === event.id;
				return (
					<View key={event.id} style={styles.card}>
						<Pressable onPress={() => setOpenId(current => current === event.id ? null : event.id)} style={[styles.eventHeader, isRtl && styles.rowRtl]}>
							<View style={styles.eventCopy}><Text style={[styles.eventTitle, isRtl && styles.rtl]}>{event[`title_${locale}`] || event.title_ru}</Text><Text style={[styles.eventDate, isRtl && styles.rtl]}>{formatEventDate(event.event_date, locale)} · {event.start_time.slice(0, 5)}–{event.end_time.slice(0, 5)}</Text><Text style={[styles.count, isRtl && styles.rtl]}>{copy.participants}: {activeGuests}/{event.capacity}</Text></View>
							<Feather color={Colors.muted} name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
						</Pressable>
						{isOpen ? <View style={styles.participants}>{eventRegistrations.length === 0 ? <Text style={styles.empty}>{copy.noParticipants}</Text> : eventRegistrations.map(registration => <Participant copy={copy} isRtl={isRtl} key={registration.id} onStatusChange={changeStatus} pending={pendingId === registration.id} profile={profiles.get(registration.user_id)} registration={registration} />)}</View> : null}
					</View>
				);
			})}
		</View>
	);
}

function Participant({ copy, isRtl, onStatusChange, pending, profile, registration }: { copy: (typeof COPY)[TLocale]; isRtl: boolean; onStatusChange: (id: string, status: 'confirmed' | 'cancelled') => Promise<void>; pending: boolean; profile?: TProfile; registration: TRegistration }) {
	const name = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || registration.user_id.slice(0, 8);
	return <View style={styles.participant}><View style={[styles.participantTop, isRtl && styles.rowRtl]}><View><Text style={[styles.name, isRtl && styles.rtl]}>{name}</Text>{profile?.phone ? <Text style={styles.phone}>{profile.phone}</Text> : null}</View><Text style={[styles.badge, statusStyle(registration.status)]}>{copy.statuses[registration.status]}</Text></View><Text style={[styles.guestCount, isRtl && styles.rtl]}>{registration.guest_count} {copy.guests}</Text><View style={[styles.actions, isRtl && styles.rowRtl]}>{registration.status !== 'confirmed' ? <Action disabled={pending} label={copy.confirm} onPress={() => void onStatusChange(registration.id, 'confirmed')} primary /> : null}{registration.status !== 'cancelled' ? <Action disabled={pending} label={copy.cancel} onPress={() => void onStatusChange(registration.id, 'cancelled')} /> : null}</View></View>;
}

function Action({ disabled, label, onPress, primary = false }: { disabled: boolean; label: string; onPress: () => void; primary?: boolean }) {
	return <Pressable disabled={disabled} onPress={onPress} style={[styles.action, primary && styles.primaryAction, disabled && styles.disabled]}><Text style={[styles.actionText, primary && styles.primaryActionText]}>{label}</Text></Pressable>;
}

function statusStyle(status: TEventRegistrationStatus) { return status === 'confirmed' ? styles.confirmed : status === 'cancelled' ? styles.cancelled : styles.pending; }

const styles = StyleSheet.create({
	container: { marginTop: Spacing.medium, gap: 12 }, loading: { minHeight: 240, alignItems: 'center', justifyContent: 'center' },
	heading: { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.72)' },
	headingIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 15, backgroundColor: Colors.accent },
	title: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 19, fontWeight: '700' }, subtitle: { marginTop: 3, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 12 },
	card: { overflow: 'hidden', borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.76)' },
	eventHeader: { minHeight: 92, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: '#EFE4D8' }, eventCopy: { minWidth: 0, flex: 1 }, eventTitle: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 15, fontWeight: '800' }, eventDate: { marginTop: 5, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 11 }, count: { marginTop: 7, color: '#725542', fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700' },
	participants: { padding: 12, gap: 10 }, participant: { padding: 12, borderWidth: 1, borderColor: '#E7DDD4', borderRadius: 14, backgroundColor: '#FFFCF9' }, participantTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }, name: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 14, fontWeight: '700' }, phone: { marginTop: 3, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 11, writingDirection: 'ltr' }, guestCount: { marginTop: 8, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 11 },
	badge: { overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, fontFamily: Fonts.sans, fontSize: 9, fontWeight: '700' }, pending: { color: '#8A621B', backgroundColor: '#FFF1D7' }, confirmed: { color: '#526C48', backgroundColor: '#E7F0E2' }, cancelled: { color: '#9A433D', backgroundColor: '#F7E3DF' },
	actions: { marginTop: 10, flexDirection: 'row', gap: 8 }, action: { minHeight: 36, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E8C2BC', borderRadius: 999, backgroundColor: '#FFF4F1' }, primaryAction: { borderColor: '#63805A', backgroundColor: '#63805A' }, actionText: { color: '#AD493F', fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700' }, primaryActionText: { color: Colors.white }, disabled: { opacity: 0.45 },
	empty: { padding: 18, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 13, textAlign: 'center' }, error: { padding: 10, color: '#AD493F', fontFamily: Fonts.sans, fontSize: 12, textAlign: 'center' }, rtl: { textAlign: 'right', writingDirection: 'rtl' }, rowRtl: { flexDirection: 'row-reverse' },
});
