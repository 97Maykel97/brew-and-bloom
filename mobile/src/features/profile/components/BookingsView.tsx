import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/languages';
import { supabase } from '@/lib/supabase';
import type { TTableBooking } from '../lib/booking-types';
import { BOOKING_TIMES, formatBookingDate, isPastBookingTime, toBookingDate } from '../lib/booking-utils';

const COPY = {
	ru: { title: 'Бронирование столика', subtitle: 'Выберите удобное время — мы подготовим столик.', date: 'Дата', time: 'Время', guests: 'Гости', comment: 'Комментарий', placeholder: 'Например, столик у окна', submit: 'Забронировать', submitting: 'Бронируем…', upcoming: 'Предстоящие', history: 'История', empty: 'Бронирований пока нет', cancel: 'Отменить бронь', cancelConfirm: 'Отменить эту бронь?', error: 'Не удалось выполнить действие.', unavailable: 'На это время свободных столиков нет.', created: 'Столик забронирован и ожидает подтверждения.', statuses: { new: 'Ожидает подтверждения', confirmed: 'Подтверждено', completed: 'Завершено', cancelled: 'Отменено' } },
	en: { title: 'Table booking', subtitle: 'Choose a convenient time and we will prepare your table.', date: 'Date', time: 'Time', guests: 'Guests', comment: 'Comment', placeholder: 'For example, a table by the window', submit: 'Book a table', submitting: 'Booking…', upcoming: 'Upcoming', history: 'History', empty: 'You have no bookings yet', cancel: 'Cancel booking', cancelConfirm: 'Cancel this booking?', error: 'Could not complete the action.', unavailable: 'There are no available tables for this time.', created: 'Your table is booked and awaiting confirmation.', statuses: { new: 'Awaiting confirmation', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' } },
	he: { title: 'הזמנת שולחן', subtitle: 'בחרו זמן נוח ואנחנו נכין את השולחן.', date: 'תאריך', time: 'שעה', guests: 'אורחים', comment: 'הערה', placeholder: 'לדוגמה, שולחן ליד החלון', submit: 'הזמנת שולחן', submitting: 'מזמינים…', upcoming: 'הזמנות קרובות', history: 'היסטוריה', empty: 'אין עדיין הזמנות', cancel: 'ביטול הזמנה', cancelConfirm: 'לבטל את ההזמנה?', error: 'לא ניתן לבצע את הפעולה.', unavailable: 'אין שולחנות פנויים בשעה הזו.', created: 'השולחן הוזמן וממתין לאישור.', statuses: { new: 'ממתין לאישור', confirmed: 'אושר', completed: 'הושלם', cancelled: 'בוטל' } },
} as const;

export default function BookingsView({ isRtl, locale }: { isRtl: boolean; locale: TLocale }) {
	const copy = COPY[locale];
	const [bookings, setBookings] = useState<TTableBooking[]>([]);
	const [date, setDate] = useState('');
	const [time, setTime] = useState('09:00');
	const [guests, setGuests] = useState(2);
	const [comment, setComment] = useState('');
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [pendingId, setPendingId] = useState<string | null>(null);
	const [showDatePicker, setShowDatePicker] = useState(false);

	const loadBookings = useCallback(async () => {
		const { data } = await supabase.from('table_bookings').select('*').order('booking_date', { ascending: false }).order('booking_time', { ascending: false });
		setBookings((data as TTableBooking[] | null) ?? []);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const initialLoadTimer = setTimeout(() => void loadBookings(), 0);
		const channel = supabase.channel(`mobile-customer-bookings-${Date.now()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'table_bookings' }, () => void loadBookings()).subscribe();
		return () => { clearTimeout(initialLoadTimer); void supabase.removeChannel(channel); };
	}, [loadBookings]);

	async function createBooking() {
		if (!date || !time || isPastBookingTime(date, time) || pendingId) return;
		setPendingId('new'); setMessage('');
		const { error } = await supabase.rpc('create_table_booking', { p_booking_date: date, p_booking_time: time, p_guest_count: guests, p_comment: comment || null });
		setPendingId(null);
		if (error) { setMessage(error.message.includes('No tables') ? copy.unavailable : copy.error); return; }
		setDate(''); setTime('09:00'); setGuests(2); setComment(''); setMessage(copy.created); await loadBookings();
	}

	function confirmCancel(booking: TTableBooking) {
		Alert.alert(copy.cancel, copy.cancelConfirm, [{ text: copy.cancel, style: 'cancel' }, { text: copy.cancel, style: 'destructive', onPress: () => void cancelBooking(booking.id) }]);
	}

	async function cancelBooking(id: string) {
		setPendingId(id); setMessage('');
		const { error } = await supabase.rpc('cancel_table_booking', { p_booking_id: id });
		setPendingId(null);
		if (error) setMessage(copy.error); else await loadBookings();
	}

	const upcoming = bookings.filter(item => ['new', 'confirmed'].includes(item.status)).sort((a, b) => `${a.booking_date}${a.booking_time}`.localeCompare(`${b.booking_date}${b.booking_time}`));
	const history = bookings.filter(item => ['completed', 'cancelled'].includes(item.status));
	const unavailableTimes = new Set(upcoming.filter(item => item.booking_date === date).map(item => item.booking_time.slice(0, 5)));
	const availableTimes = BOOKING_TIMES.filter(item => !isPastBookingTime(date, item) && !unavailableTimes.has(item));
	const isSelectedTimeAvailable = availableTimes.includes(time);

	function selectDate(selected: Date) {
		const nextDate = toBookingDate(selected);
		const blockedTimes = new Set(upcoming.filter(item => item.booking_date === nextDate).map(item => item.booking_time.slice(0, 5)));
		const firstAvailableTime = BOOKING_TIMES.find(item => !isPastBookingTime(nextDate, item) && !blockedTimes.has(item)) ?? '';
		setDate(nextDate);
		setTime(firstAvailableTime);
	}

	return <View style={styles.container}>
		<View style={styles.formCard}><View style={[styles.heading, isRtl && styles.rtlRow]}><View style={styles.headingIcon}><Feather name='calendar' size={20} color={Colors.accent} /></View><View style={styles.headingCopy}><Text style={[styles.title, isRtl && styles.rtlText]}>{copy.title}</Text><Text style={[styles.subtitle, isRtl && styles.rtlText]}>{copy.subtitle}</Text></View></View>
			<Text style={[styles.label, isRtl && styles.rtlText]}>{copy.date}</Text><Pressable onPress={() => setShowDatePicker(true)} style={[styles.fieldButton, isRtl && styles.rtlRow]}><Feather name='calendar' size={17} color={Colors.muted} /><Text style={[styles.fieldText, isRtl && styles.rtlText]}>{date ? formatBookingDate(date, locale) : copy.date}</Text><Feather name='chevron-down' size={16} color={Colors.muted} /></Pressable>
			<Text style={[styles.label, isRtl && styles.rtlText]}>{copy.time}</Text><ScrollView contentContainerStyle={styles.times} horizontal showsHorizontalScrollIndicator={false}>{BOOKING_TIMES.map(item => { const disabled = Boolean(date) && (isPastBookingTime(date, item) || unavailableTimes.has(item)); return <Pressable disabled={disabled} key={item} onPress={() => setTime(item)} style={[styles.time, time === item && styles.timeActive, disabled && styles.timeDisabled]}><Text style={[styles.timeText, time === item && styles.timeTextActive, disabled && styles.timeTextDisabled]}>{item}</Text></Pressable>; })}</ScrollView>
			<View style={[styles.guestRow, isRtl && styles.rtlRow]}><Text style={styles.label}>{copy.guests}</Text><View style={styles.stepper}><Pressable disabled={guests <= 1} onPress={() => setGuests(value => Math.max(1, value - 1))} style={styles.stepButton}><Feather name='minus' size={17} color={Colors.foreground} /></Pressable><Text style={styles.guestValue}>{guests}</Text><Pressable disabled={guests >= 12} onPress={() => setGuests(value => Math.min(12, value + 1))} style={styles.stepButton}><Feather name='plus' size={17} color={Colors.foreground} /></Pressable></View></View>
			<Text style={[styles.label, isRtl && styles.rtlText]}>{copy.comment}</Text><TextInput maxLength={500} multiline onChangeText={setComment} placeholder={copy.placeholder} placeholderTextColor={Colors.muted} style={[styles.comment, isRtl && styles.rtlText]} value={comment} />
			{message ? <Text style={[styles.message, isRtl && styles.rtlText]}>{message}</Text> : date && availableTimes.length === 0 ? <Text style={[styles.message, styles.errorMessage, isRtl && styles.rtlText]}>{copy.unavailable}</Text> : null}<Pressable disabled={!date || !isSelectedTimeAvailable || pendingId === 'new'} onPress={() => void createBooking()} style={({ pressed }) => [styles.submit, (pressed || !date || !isSelectedTimeAvailable || pendingId === 'new') && styles.disabled]}>{pendingId === 'new' ? <ActivityIndicator color={Colors.white} size='small' /> : <Feather name='calendar' size={17} color={Colors.white} />}<Text style={styles.submitText}>{pendingId === 'new' ? copy.submitting : copy.submit}</Text></Pressable>
		</View>
		<BookingGroup bookings={upcoming} copy={copy} isLoading={isLoading} isRtl={isRtl} locale={locale} onCancel={confirmCancel} pendingId={pendingId} title={copy.upcoming} />
		{history.length ? <BookingGroup bookings={history} copy={copy} isLoading={false} isRtl={isRtl} locale={locale} onCancel={confirmCancel} pendingId={pendingId} title={copy.history} /> : null}
		{Platform.OS === 'android' && showDatePicker ? <DateTimePicker minimumDate={new Date()} mode='date' onChange={(_, selected) => { setShowDatePicker(false); if (selected) selectDate(selected); }} value={date ? new Date(`${date}T12:00:00`) : new Date()} /> : null}
		{Platform.OS === 'ios' ? <Modal animationType='fade' onRequestClose={() => setShowDatePicker(false)} transparent visible={showDatePicker}><Pressable onPress={() => setShowDatePicker(false)} style={styles.modalBackdrop}><Pressable onPress={event => event.stopPropagation()} style={styles.dateModal}><DateTimePicker display='inline' minimumDate={new Date()} mode='date' onChange={(_, selected) => { if (selected) selectDate(selected); }} value={date ? new Date(`${date}T12:00:00`) : new Date()} /><Pressable onPress={() => setShowDatePicker(false)} style={styles.dateDone}><Feather name='check' size={18} color={Colors.white} /></Pressable></Pressable></Pressable></Modal> : null}
	</View>;
}

type TCopy = (typeof COPY)[TLocale];
function BookingGroup({ bookings, copy, isLoading, isRtl, locale, onCancel, pendingId, title }: { bookings: TTableBooking[]; copy: TCopy; isLoading: boolean; isRtl: boolean; locale: TLocale; onCancel: (booking: TTableBooking) => void; pendingId: string | null; title: string }) {
	return <View style={styles.group}><Text style={[styles.groupTitle, isRtl && styles.rtlText]}>{title}</Text>{isLoading ? <ActivityIndicator color={Colors.accent} /> : bookings.length === 0 ? <View style={styles.empty}><Feather name='calendar' size={23} color={Colors.accent} /><Text style={styles.emptyText}>{copy.empty}</Text></View> : bookings.map(booking => <View key={booking.id} style={styles.card}><View style={[styles.cardHeader, isRtl && styles.rtlRow]}><View><Text style={[styles.cardDate, isRtl && styles.rtlText]}>{formatBookingDate(booking.booking_date, locale)}</Text><Text style={[styles.cardMeta, isRtl && styles.rtlText]}>{booking.booking_time.slice(0, 5)} · {booking.guest_count} {copy.guests.toLocaleLowerCase()}</Text></View><Text style={[styles.status, statusStyle(booking.status)]}>{copy.statuses[booking.status]}</Text></View>{booking.comment ? <Text style={[styles.cardComment, isRtl && styles.rtlText]}>{booking.comment}</Text> : null}{booking.status === 'new' ? <Pressable disabled={pendingId === booking.id} onPress={() => onCancel(booking)} style={styles.cancelButton}><Feather name='x-circle' size={15} color='#A64338' /><Text style={styles.cancelText}>{copy.cancel}</Text></Pressable> : null}</View>)}</View>;
}

function statusStyle(status: TTableBooking['status']) { return status === 'new' ? styles.statusNew : status === 'confirmed' ? styles.statusConfirmed : status === 'cancelled' ? styles.statusCancelled : styles.statusCompleted; }

const styles = StyleSheet.create({
	container: { marginTop: Spacing.medium, gap: Spacing.medium }, formCard: { padding: Spacing.medium, gap: 10, borderWidth: 1, borderColor: '#E1D4C8', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.82)' }, heading: { marginBottom: 5, flexDirection: 'row', alignItems: 'center', gap: 10 }, headingIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 22, backgroundColor: '#EFE3D6' }, headingCopy: { minWidth: 0, flex: 1 }, title: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 18, fontWeight: '800' }, subtitle: { marginTop: 3, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 11, lineHeight: 16 }, label: { marginTop: 4, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700' }, fieldButton: { height: 46, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9, borderWidth: 1, borderColor: '#DDCFC2', borderRadius: 12, backgroundColor: '#FFFDFB' }, fieldText: { minWidth: 0, flex: 1, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13 }, times: { gap: 7, paddingVertical: 2 }, time: { minWidth: 64, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDCFC2', borderRadius: 19, backgroundColor: '#FFFDFB' }, timeActive: { borderColor: Colors.accent, backgroundColor: Colors.accent }, timeDisabled: { borderColor: '#E8E1DA', backgroundColor: '#F2EFEC' }, timeText: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 12, fontWeight: '700' }, timeTextActive: { color: Colors.white }, timeTextDisabled: { color: '#B9B0A9' }, guestRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, stepper: { flexDirection: 'row', alignItems: 'center', gap: 10 }, stepButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#DDCFC2', borderRadius: 18, backgroundColor: '#FFFDFB' }, guestValue: { minWidth: 24, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 16, fontWeight: '800', textAlign: 'center' }, comment: { minHeight: 82, padding: 12, color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, textAlignVertical: 'top', borderWidth: 1, borderColor: '#DDCFC2', borderRadius: 12, backgroundColor: '#FFFDFB' }, message: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 11, lineHeight: 16 }, errorMessage: { color: '#A64338' }, submit: { minHeight: 46, marginTop: 4, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 23, backgroundColor: Colors.accent }, submitText: { color: Colors.white, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '800' }, disabled: { opacity: 0.5 }, group: { padding: 13, gap: 10, borderWidth: 1, borderColor: '#E1D4C8', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.65)' }, groupTitle: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 15, fontWeight: '800' }, empty: { minHeight: 120, alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: '#DCCCC0', borderRadius: 15 }, emptyText: { color: Colors.muted, fontFamily: Fonts.sans, fontSize: 12 }, card: { padding: 13, borderWidth: 1, borderColor: '#E5D9CE', borderRadius: 15, backgroundColor: '#FFFDFB' }, cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }, cardDate: { color: Colors.foreground, fontFamily: Fonts.sans, fontSize: 13, fontWeight: '800' }, cardMeta: { marginTop: 4, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 11 }, status: { overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5, fontFamily: Fonts.sans, fontSize: 9, fontWeight: '800', borderRadius: 99 }, statusNew: { color: '#8A621B', backgroundColor: '#FFF1D7' }, statusConfirmed: { color: '#526C48', backgroundColor: '#E7F0E2' }, statusCompleted: { color: '#675E58', backgroundColor: '#ECE8E4' }, statusCancelled: { color: '#9A433D', backgroundColor: '#F7E3DF' }, cardComment: { marginTop: 10, padding: 10, color: Colors.muted, fontFamily: Fonts.sans, fontSize: 11, lineHeight: 16, borderRadius: 10, backgroundColor: '#F6EEE6' }, cancelButton: { minHeight: 38, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#E6BDB5', borderRadius: 19, backgroundColor: '#FFF5F2' }, cancelText: { color: '#A64338', fontFamily: Fonts.sans, fontSize: 11, fontWeight: '800' }, rtlRow: { flexDirection: 'row-reverse' }, rtlText: { textAlign: 'right', writingDirection: 'rtl' }, modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(35,27,22,0.4)' }, dateModal: { width: '100%', maxWidth: 390, padding: 14, borderRadius: 20, backgroundColor: Colors.background }, dateDone: { width: 46, height: 42, alignSelf: 'flex-end', alignItems: 'center', justifyContent: 'center', borderRadius: 21, backgroundColor: Colors.accent },
});
