import {
	CalendarDays,
	CalendarRange,
	LayoutDashboard,
	Settings,
	ShoppingBag,
	UtensilsCrossed,
	UsersRound,
} from 'lucide-react';

import type { TAdminSection } from '../types';

export const adminNavigationItems = [
	{ section: 'overview', icon: LayoutDashboard },
	{ section: 'orders', icon: ShoppingBag },
	{ section: 'bookings', icon: CalendarDays },
	{ section: 'users', icon: UsersRound },
	{ section: 'menu', icon: UtensilsCrossed },
	{ section: 'events', icon: CalendarRange },
	{ section: 'settings', icon: Settings },
] satisfies {
	section: TAdminSection;
	icon: typeof LayoutDashboard;
}[];
