import type { TAdminSection } from '../types';

const ADMIN_SECTIONS: TAdminSection[] = [
	'overview',
	'orders',
	'bookings',
	'users',
	'menu',
	'events',
	'settings',
];

export function getAdminSection(section?: string): TAdminSection {
	return ADMIN_SECTIONS.includes(section as TAdminSection)
		? (section as TAdminSection)
		: 'overview';
}
