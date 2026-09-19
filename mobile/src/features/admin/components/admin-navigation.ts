import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { TAdminSection } from '../types';

export const adminNavigationItems = [
	{ section: 'overview', icon: 'grid' },
	{ section: 'orders', icon: 'shopping-bag' },
	{ section: 'bookings', icon: 'calendar' },
	{ section: 'users', icon: 'users' },
	{ section: 'menu', icon: 'coffee' },
	{ section: 'events', icon: 'bookmark' },
	{ section: 'settings', icon: 'settings' },
] satisfies {
	section: TAdminSection;
	icon: ComponentProps<typeof Feather>['name'];
}[];
