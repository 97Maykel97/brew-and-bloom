import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Modal,
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import eveningImage from '@/assets/images/event-cafe-evening.webp';
import tastingImage from '@/assets/images/event-coffee-tasting.webp';
import Header from '@/components/Header';
import { Colors } from '@/constants/theme';
import { getLocale } from '@/i18n/locale';
import { type TLocale, translations } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';
import { eventTranslations } from './event-translations';
import { formatEventDate, formatEventTime, getEventDescription, getEventTitle } from './event-utils';
import { styles } from './events-screen.styles';
import type { TEventRegistration, TEventType, TPublicEvent } from './types';

type TFilter = 'all' | TEventType;

const FILTERS: TFilter[] = ['all', 'coffee', 'latte_art', 'music', 'community'];

export default function EventsScreen() {
	const params = useLocalSearchParams<{ locale?: string; eventId?: string }>();
	const locale = getLocale(params.locale);
	const copy = eventTranslations[locale];
	const appCopy = translations[locale];
	const isRtl = locale === 'he';
	const [events, setEvents] = useState<TPublicEvent[]>([]);
	const [registrations, setRegistrations] = useState<TEventRegistration[]>([]);
	const [selectedEvent, setSelectedEvent] = useState<TPublicEvent | null>(null);
	const [filter, setFilter] = useState<TFilter>('all');
	const [guestCount, setGuestCount] = useState(1);
	const [isSignedIn, setIsSignedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isPending, setIsPending] = useState(false);
	const [message, setMessage] = useState('');
	const [loadError, setLoadError] = useState('');
	const hasHandledRequestedEvent = useRef(false);

	const loadData = useCallback(async () => {
		const [{ data: eventRows, error: eventError }, { data: authData }] = await Promise.all([
			supabase.rpc('get_public_events'),
			supabase.auth.getUser(),
		]);
		const user = authData.user;
		let registrationRows: TEventRegistration[] = [];

		if (user) {
			const { data } = await supabase
				.from('event_registrations')
				.select('id, event_id, guest_count, status');
			registrationRows = (data as TEventRegistration[] | null) ?? [];
		}

		if (!eventError) {
			const nextEvents = (eventRows as TPublicEvent[] | null) ?? [];
			setEvents(nextEvents);
			setSelectedEvent(current => current
				? nextEvents.find(event => event.id === current.id) ?? null
				: null);
			if (!hasHandledRequestedEvent.current && params.eventId) {
				setSelectedEvent(nextEvents.find(event => event.id === params.eventId) ?? null);
				hasHandledRequestedEvent.current = true;
			}
			setLoadError('');
		} else {
			setLoadError(copy.error);
		}
		setRegistrations(registrationRows);
		setIsSignedIn(Boolean(user));
		setIsLoading(false);
	}, [copy.error, params.eventId]);

	useEffect(() => {
		const initialLoadTimer = setTimeout(() => void loadData(), 0);
		const refreshTimer = setInterval(() => void loadData(), 15_000);
		const channel = supabase
			.channel(`mobile-events-${Date.now()}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => void loadData())
			.on('postgres_changes', { event: '*', schema: 'public', table: 'event_registrations' }, () => void loadData())
			.subscribe();

		return () => {
			clearTimeout(initialLoadTimer);
			clearInterval(refreshTimer);
			void supabase.removeChannel(channel);
		};
	}, [loadData]);

	const visibleEvents = useMemo(
		() => filter === 'all' ? events : events.filter(event => event.event_type === filter),
		[events, filter],
	);

	function changeLocale(nextLocale: TLocale) {
		router.setParams({ locale: nextLocale });
	}

	function openEvent(event: TPublicEvent) {
		setSelectedEvent(event);
		setGuestCount(1);
		setMessage('');
	}

	function closeEvent() {
		if (isPending) return;
		setSelectedEvent(null);
		setMessage('');
	}

	async function register(event: TPublicEvent) {
		if (!isSignedIn) {
			closeEvent();
			router.navigate({ pathname: '/auth/login', params: { locale, next: 'events', eventId: event.id } });
			return;
		}

		setIsPending(true);
		setMessage('');
		const { error } = await supabase.rpc('register_for_event', {
			p_event_id: event.id,
			p_guest_count: guestCount,
		});
		setIsPending(false);
		if (error) setMessage(copy.error);
		else {
			setMessage(copy.registered);
			await loadData();
		}
	}

	function confirmCancellation(registration: TEventRegistration) {
		Alert.alert(copy.cancel, copy.cancelConfirm, [
			{ text: copy.close, style: 'cancel' },
			{ text: copy.cancel, style: 'destructive', onPress: () => void cancelRegistration(registration) },
		]);
	}

	async function cancelRegistration(registration: TEventRegistration) {
		setIsPending(true);
		setMessage('');
		const { error } = await supabase.rpc('cancel_event_registration', {
			p_registration_id: registration.id,
		});
		setIsPending(false);
		if (error) setMessage(copy.error);
		else await loadData();
	}

	return (
		<SafeAreaView style={styles.screen}>
			<Header
				locale={locale}
				navItems={appCopy.nav}
				onLocaleChange={changeLocale}
				searchPlaceholder={appCopy.searchPlaceholder}
			/>
			<FlatList
				contentContainerStyle={styles.content}
				data={isLoading ? [] : visibleEvents}
				keyExtractor={event => event.id}
				ListHeaderComponent={(
					<>
						<View style={styles.hero}>
							<Text style={[styles.eyebrow, isRtl && styles.rtlText]}>{copy.eyebrow}</Text>
							<Text style={[styles.title, isRtl && styles.rtlText]}>{copy.title}</Text>
							<Text style={[styles.description, isRtl && styles.rtlText]}>{copy.description}</Text>
						</View>
						<ScrollView contentContainerStyle={styles.filters} horizontal showsHorizontalScrollIndicator={false}>
							{FILTERS.map(item => (
								<Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.activeFilter]}>
									<Text style={[styles.filterText, filter === item && styles.activeFilterText]}>{item === 'all' ? copy.all : copy.types[item]}</Text>
								</Pressable>
							))}
						</ScrollView>
					</>
				)}
				ListEmptyComponent={isLoading ? (
					<View style={styles.loading}><ActivityIndicator color={Colors.accent} /></View>
				) : (
					<View style={styles.empty}><Feather color={Colors.accent} name='calendar' size={28} /><Text style={styles.emptyText}>{loadError || copy.empty}</Text></View>
				)}
				ListFooterComponent={loadError && events.length > 0 ? <Text style={styles.loadError}>{loadError}</Text> : null}
				renderItem={({ item }) => (
					<EventCard
						copy={copy}
						event={item}
						isRtl={isRtl}
						locale={locale}
						onOpen={() => openEvent(item)}
					/>
				)}
			/>
			<EventDialog
				copy={copy}
				event={selectedEvent}
				guestCount={guestCount}
				isPending={isPending}
				isRtl={isRtl}
				isSignedIn={isSignedIn}
				locale={locale}
				message={message}
				onCancel={confirmCancellation}
				onClose={closeEvent}
				onGuestCountChange={setGuestCount}
				onRegister={register}
				registration={selectedEvent ? registrations.find(item => item.event_id === selectedEvent.id && item.status !== 'cancelled') : undefined}
			/>
		</SafeAreaView>
	);
}

type TCopy = (typeof eventTranslations)[TLocale];

function EventCard({ copy, event, isRtl, locale, onOpen }: { copy: TCopy; event: TPublicEvent; isRtl: boolean; locale: TLocale; onOpen: () => void }) {
	return (
		<View style={styles.list}>
			<View style={styles.card}>
				<View style={styles.imageWrap}>
					<Image contentFit='cover' source={getEventImage(event)} style={styles.image} />
					<View style={[styles.typeBadge, isRtl && styles.typeBadgeRtl]}><Text style={styles.typeText}>{copy.types[event.event_type]}</Text></View>
				</View>
				<View style={styles.cardBody}>
					<Text style={[styles.date, isRtl && styles.rtlText]}>{formatEventDate(event.event_date, locale)}</Text>
					<Text numberOfLines={2} style={[styles.cardTitle, isRtl && styles.rtlText]}>{getEventTitle(event, locale)}</Text>
					<Text numberOfLines={3} style={[styles.cardDescription, isRtl && styles.rtlText]}>{getEventDescription(event, locale)}</Text>
					<View style={styles.cardFooter}>
						<View style={styles.meta}><Feather color='#725542' name='clock' size={15} /><Text style={styles.metaText}>{formatEventTime(event)}</Text></View>
						<Pressable onPress={onOpen} style={styles.detailButton}><Text style={styles.detailButtonText}>{copy.details}</Text></Pressable>
					</View>
				</View>
			</View>
		</View>
	);
}

function EventDialog({ copy, event, guestCount, isPending, isRtl, isSignedIn, locale, message, onCancel, onClose, onGuestCountChange, onRegister, registration }: { copy: TCopy; event: TPublicEvent | null; guestCount: number; isPending: boolean; isRtl: boolean; isSignedIn: boolean; locale: TLocale; message: string; onCancel: (registration: TEventRegistration) => void; onClose: () => void; onGuestCountChange: (count: number) => void; onRegister: (event: TPublicEvent) => void; registration?: TEventRegistration }) {
	if (!event) return null;
	const maxGuests = Math.max(1, Math.min(10, event.available_spots));
	return (
		<Modal animationType='slide' onRequestClose={onClose} transparent visible>
			<View style={styles.backdrop}>
				<View style={styles.dialog}>
					<ScrollView>
						<Image contentFit='cover' source={getEventImage(event)} style={styles.dialogImage} />
						<Pressable accessibilityLabel={copy.close} onPress={onClose} style={[styles.close, isRtl && styles.closeRtl]}><Feather color={Colors.foreground} name='x' size={19} /></Pressable>
						<View style={styles.dialogContent}>
							<Text style={styles.typeText}>{copy.types[event.event_type]}</Text>
							<Text style={[styles.dialogTitle, isRtl && styles.rtlText]}>{getEventTitle(event, locale)}</Text>
							<Text style={[styles.dialogDescription, isRtl && styles.rtlText]}>{getEventDescription(event, locale)}</Text>
							<View style={styles.info}>
								<InfoRow label={copy.date} value={formatEventDate(event.event_date, locale)} />
								<InfoRow label={copy.time} value={formatEventTime(event)} />
								<InfoRow label={copy.spots} value={String(event.available_spots)} />
							</View>
							{registration ? (
								<><View style={styles.status}><Text style={styles.statusText}>{copy.statuses[registration.status]} · {registration.guest_count}</Text></View><Pressable disabled={isPending} onPress={() => onCancel(registration)} style={[styles.cancelButton, isPending && styles.disabled]}><Text style={styles.cancelText}>{isPending ? copy.cancelling : copy.cancel}</Text></Pressable></>
							) : (
								<><Text style={styles.guestLabel}>{copy.guests}</Text><View style={styles.guestRow}><StepperButton disabled={guestCount <= 1} icon='minus' onPress={() => onGuestCountChange(Math.max(1, guestCount - 1))} /><Text style={styles.guestCount}>{guestCount}</Text><StepperButton disabled={guestCount >= maxGuests || event.available_spots === 0} icon='plus' onPress={() => onGuestCountChange(Math.min(maxGuests, guestCount + 1))} /></View><Pressable disabled={isPending || event.available_spots === 0} onPress={() => void onRegister(event)} style={[styles.primaryButton, (isPending || event.available_spots === 0) && styles.disabled]}><Text style={styles.primaryButtonText}>{event.available_spots === 0 ? copy.full : isSignedIn ? copy.register : copy.signIn}</Text></Pressable></>
							)}
							{message ? <Text style={styles.message}>{message}</Text> : null}
						</View>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

function InfoRow({ label, value }: { label: string; value: string }) {
	return <View style={styles.infoRow}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

function StepperButton({ disabled, icon, onPress }: { disabled: boolean; icon: 'minus' | 'plus'; onPress: () => void }) {
	return <Pressable disabled={disabled} onPress={onPress} style={[styles.stepperButton, disabled && styles.disabled]}><Feather color={Colors.foreground} name={icon} size={17} /></Pressable>;
}

function getEventImage(event: TPublicEvent) {
	return event.event_type === 'music' || event.event_type === 'community' ? eveningImage : tastingImage;
}
