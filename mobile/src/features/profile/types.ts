export type TProfileTab =
	| 'profile'
	| 'orders'
	| 'bookings'
	| 'events'
	| 'favorites'
	| 'bonuses'
	| 'settings';

export type TProfileOrderStatus =
	| 'all'
	| 'processing'
	| 'preparing'
	| 'ready'
	| 'completed'
	| 'cancelled';

export type TMobileProfileData = {
	birthDate: string;
	birthDateValue: string;
	bonusPoints: number;
	displayName: string;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
};
