export type TBookingStatus = 'new' | 'confirmed' | 'completed' | 'cancelled';

export type TTableBooking = {
	id: string;
	user_id: string;
	booking_date: string;
	booking_time: string;
	guest_count: number;
	comment: string | null;
	status: TBookingStatus;
	created_at: string;
	updated_at: string;
};

export type TBookingDraft = {
	date: string;
	time: string;
	guests: number;
	comment: string;
};
