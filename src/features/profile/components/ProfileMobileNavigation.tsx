import Link from 'next/link';

import type { TProfileCopy } from '../profile-copy';
import type { TProfileTab } from '../types';

type TProfileMobileNavigationProps = {
	activeTab: TProfileTab;
	copy: TProfileCopy;
};

export default function ProfileMobileNavigation({
	activeTab,
	copy,
}: TProfileMobileNavigationProps) {
	const navigationItems = [
		{
			label: copy.sidebar.profile,
			href: '?tab=profile#profile',
			active: activeTab === 'profile',
		},
		{
			label: copy.sidebar.orders,
			href: '?tab=orders#orders',
			active: activeTab === 'orders',
		},
		{
			label: copy.bookings,
			href: '?tab=bookings#bookings',
			active: activeTab === 'bookings',
		},
		{
			label: copy.sidebar.favorites,
			href: '?tab=favorites#favorites',
			active: activeTab === 'favorites',
		},
		{
			label: copy.sidebar.bonuses,
			href: '?tab=bonuses#bonuses',
			active: activeTab === 'bonuses',
		},
		{
			label: copy.sidebar.settings,
			href: '?tab=settings#settings',
			active: activeTab === 'settings',
		},
	];

	return (
		<nav
			aria-label={copy.title}
			className='mt-6 grid grid-cols-3 gap-1 border-b border-[#e2d7cc] lg:hidden'
		>
			{navigationItems.map(item => (
				<Link
					key={item.label}
					href={item.href}
					className={
						'flex min-h-11 items-center justify-center border-b-2 px-1.5 pb-2 text-center text-[11px] leading-tight transition sm:px-3 sm:text-sm ' +
						(item.active
							? 'border-[var(--accent)] font-semibold text-[var(--foreground)]'
							: 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]')
					}
				>
					{item.label}
				</Link>
			))}
		</nav>
	);
}
