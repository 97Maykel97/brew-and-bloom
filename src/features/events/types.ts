export type TEventType = 'coffee' | 'latte_art' | 'music' | 'community';
export type TEventRegistrationStatus = 'pending' | 'confirmed' | 'cancelled';

export type TPublicEvent = {
	id: string;
	slug: string;
	event_type: TEventType;
	title_ru: string;
	title_en: string;
	title_he: string;
	description_ru: string;
	description_en: string;
	description_he: string;
	event_date: string;
	start_time: string;
	end_time: string;
	capacity: number;
	reserved_guests: number;
	available_spots: number;
};

export type TEventRegistration = {
	id: string;
	event_id: string;
	user_id: string;
	guest_count: number;
	status: TEventRegistrationStatus;
	created_at: string;
	updated_at: string;
};
