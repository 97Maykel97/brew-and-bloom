export type TProfileLocale = 'ru' | 'en' | 'he';

export type TProfileTab =
	| 'profile'
	| 'orders'
	| 'bookings'
	| 'events'
	| 'favorites'
	| 'bonuses'
	| 'settings';

export type TOrderStatus =
	| 'all'
	| 'processing'
	| 'preparing'
	| 'ready'
	| 'completed'
	| 'cancelled';

export type TProfileViewModel = {
	fullName: string;
	displayName: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	birthDate: string;
	birthDateValue: string;
	bonusPoints: number;
};
