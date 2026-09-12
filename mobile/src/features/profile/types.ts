export type TProfileTab =
	| 'profile'
	| 'orders'
	| 'bookings'
	| 'favorites'
	| 'bonuses'
	| 'settings';

export type TProfileOrderStatus =
	| 'all'
	| 'processing'
	| 'ready'
	| 'completed';

export type TMobileProfileData = {
	birthDate: string;
	bonusPoints: number;
	displayName: string;
	email: string;
	firstName: string;
	lastName: string;
	phone: string;
};
