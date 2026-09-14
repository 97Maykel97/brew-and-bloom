import type { TLocale } from '@/i18n/languages';

export type TAdminLocale = TLocale;

export type TAdminSection =
	| 'overview'
	| 'orders'
	| 'bookings'
	| 'users'
	| 'menu'
	| 'events'
	| 'settings';

export type TAdminCopy = {
	title: string;
	subtitle: string;
	administrator: string;
	home: string;
	profile: string;
	logout: string;
	navigationLabel: string;
	navigation: Record<TAdminSection, string>;
	overview: {
		orders: string;
		bookings: string;
		users: string;
		menuItems: string;
		recentActivity: string;
		emptyActivity: string;
	};
	sectionDescriptions: Record<Exclude<TAdminSection, 'overview'>, string>;
};
