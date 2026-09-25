'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { TBookingDraft, TTableBooking } from './booking-types';

export function useCustomerBookings() {
	const [bookings, setBookings] = useState<TTableBooking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [pendingId, setPendingId] = useState<string | null>(null);

	const loadBookings = useCallback(async () => {
		const { data } = await createClient().from('table_bookings').select('*').order('booking_date', { ascending: false }).order('booking_time', { ascending: false });
		setBookings((data as TTableBooking[] | null) ?? []);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		const timer = window.setTimeout(() => void loadBookings(), 0);
		const supabase = createClient();
		const channel = supabase.channel(`customer-bookings-${crypto.randomUUID()}`).on('postgres_changes', { event: '*', schema: 'public', table: 'table_bookings' }, () => void loadBookings()).subscribe();
		return () => { window.clearTimeout(timer); void supabase.removeChannel(channel); };
	}, [loadBookings]);

	async function createBooking(draft: TBookingDraft) {
		setPendingId('new');
		const { error } = await createClient().rpc('create_table_booking', {
			p_booking_date: draft.date, p_booking_time: draft.time, p_guest_count: draft.guests, p_comment: draft.comment || null,
		});
		setPendingId(null);
		if (!error) await loadBookings();
		return error;
	}

	async function cancelBooking(id: string) {
		setPendingId(id);
		const { error } = await createClient().rpc('cancel_table_booking', { p_booking_id: id });
		setPendingId(null);
		if (!error) await loadBookings();
		return error;
	}

	return { bookings, cancelBooking, createBooking, isLoading, pendingId };
}
