import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import eveningImage from '@/assets/images/event-cafe-evening.webp';
import tastingImage from '@/assets/images/event-coffee-tasting.webp';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { eventTranslations } from '@/features/events/event-translations';
import { formatEventDate, formatEventTime, getEventDescription, getEventTitle } from '@/features/events/event-utils';
import type { TPublicEvent } from '@/features/events/types';
import type { TLocale } from '@/i18n/translations';
import { supabase } from '@/lib/supabase';

const SECTION_COPY = {
	ru: { eyebrow: 'Встречаемся в Brew & Bloom', title: 'Ближайшие события', description: 'Кофе становится ещё вкуснее, когда им делятся.', viewAll: 'Все события' },
	en: { eyebrow: 'Meet at Brew & Bloom', title: 'Upcoming events', description: 'Coffee tastes even better when it is shared.', viewAll: 'All events' },
	he: { eyebrow: 'נפגשים ב־Brew & Bloom', title: 'אירועים קרובים', description: 'קפה טעים אפילו יותר כשחולקים אותו.', viewAll: 'כל האירועים' },
} as const;

export default function HomeEvents({ isRtl, locale }: { isRtl: boolean; locale: TLocale }) {
	const { width } = useWindowDimensions();
	const copy = SECTION_COPY[locale];
	const typeCopy = eventTranslations[locale].types;
	const [events, setEvents] = useState<TPublicEvent[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const cardWidth = Math.min(Math.max(width * 0.78, 270), 320);

	const loadEvents = useCallback(async () => {
		const { data, error } = await supabase.rpc('get_public_events');
		if (!error) setEvents(((data as TPublicEvent[] | null) ?? []).slice(0, 3));
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const initialLoadTimer = setTimeout(() => void loadEvents(), 0);
		const refreshTimer = setInterval(() => void loadEvents(), 15_000);
		const channel = supabase
			.channel(`mobile-home-events-${Date.now()}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => void loadEvents())
			.subscribe();
		return () => {
			clearTimeout(initialLoadTimer);
			clearInterval(refreshTimer);
			void supabase.removeChannel(channel);
		};
	}, [loadEvents]);

	function openEvents() {
		router.navigate({ pathname: '/events', params: { locale } });
	}

	return (
		<View style={styles.section}>
			<View style={[styles.heading, isRtl && styles.rowRtl]}>
				<View style={styles.headingCopy}>
					<Text style={[styles.eyebrow, isRtl && styles.rtlText]}>{copy.eyebrow}</Text>
					<Text style={[styles.title, isRtl && styles.rtlText]}>{copy.title}</Text>
					<Text style={[styles.description, isRtl && styles.rtlText]}>{copy.description}</Text>
				</View>
				<Pressable onPress={openEvents} style={[styles.viewAll, isRtl && styles.rowRtl]}>
					<Text style={styles.viewAllText}>{copy.viewAll}</Text>
					<Feather color={Colors.foreground} name={isRtl ? 'arrow-left' : 'arrow-right'} size={15} />
				</Pressable>
			</View>

			{isLoading ? (
				<View style={styles.loading}><ActivityIndicator color={Colors.accent} /></View>
			) : events.length === 0 ? null : (
				<FlatList
					contentContainerStyle={styles.list}
					data={events}
					horizontal
					inverted={isRtl}
					keyExtractor={event => event.id}
					renderItem={({ item }) => (
						<Pressable onPress={openEvents} style={[styles.card, { width: cardWidth }]}>
							<View style={styles.imageWrap}>
								<Image contentFit='cover' source={item.event_type === 'music' || item.event_type === 'community' ? eveningImage : tastingImage} style={styles.image} />
								<View style={[styles.typeBadge, isRtl && styles.typeBadgeRtl]}><Text style={styles.typeText}>{typeCopy[item.event_type]}</Text></View>
							</View>
							<View style={styles.cardContent}>
								<Text style={[styles.date, isRtl && styles.rtlText]}>{formatEventDate(item.event_date, locale)}</Text>
								<Text numberOfLines={2} style={[styles.cardTitle, isRtl && styles.rtlText]}>{getEventTitle(item, locale)}</Text>
								<Text numberOfLines={2} style={[styles.cardDescription, isRtl && styles.rtlText]}>{getEventDescription(item, locale)}</Text>
								<View style={styles.time}><Feather color='#725542' name='clock' size={14} /><Text style={styles.timeText}>{formatEventTime(item)}</Text></View>
							</View>
						</Pressable>
					)}
					showsHorizontalScrollIndicator={false}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	section: { paddingVertical: 36, backgroundColor: '#F2E9DF' },
	heading: { paddingHorizontal: Spacing.medium, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
	headingCopy: { minWidth: 0, flex: 1 }, eyebrow: { color: '#8A6D5A', fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
	title: { marginTop: 7, color: Colors.foreground, fontFamily: Fonts.serif, fontSize: 32, lineHeight: 36 }, description: { marginTop: 7, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 13, lineHeight: 19 },
	viewAll: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5 }, viewAllText: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 11, fontWeight: '700' },
	list: { paddingHorizontal: Spacing.medium, paddingTop: 22, gap: 14 }, loading: { height: 390, alignItems: 'center', justifyContent: 'center' },
	card: { height: 390, overflow: 'hidden', borderWidth: 1, borderColor: '#DFD2C5', borderRadius: 22, backgroundColor: '#FFFCF9' },
	imageWrap: { position: 'relative' }, image: { width: '100%', height: 190 }, typeBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.94)' }, typeBadgeRtl: { left: undefined, right: 12 }, typeText: { color: '#725542', fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700' },
	cardContent: { flex: 1, padding: 16 }, date: { color: '#8A6D5A', fontFamily: Fonts.sans, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }, cardTitle: { minHeight: 52, marginTop: 7, color: Colors.foreground, fontFamily: Fonts.serif, fontSize: 23, lineHeight: 26 }, cardDescription: { minHeight: 38, marginTop: 6, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 12, lineHeight: 18 }, time: { marginTop: 'auto', flexDirection: 'row', alignItems: 'center', gap: 6 }, timeText: { color: '#725542', fontFamily: Fonts.sans, fontSize: 11, fontWeight: '600' },
	rtlText: { textAlign: 'right', writingDirection: 'rtl' }, rowRtl: { flexDirection: 'row-reverse' },
});
