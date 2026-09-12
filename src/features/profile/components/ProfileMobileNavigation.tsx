import type { TProfileCopy } from '../profile-copy';
import type { TProfileTab } from '../types';

type TProfileMobileNavigationProps = {
	activeTab: TProfileTab;
	copy: TProfileCopy;
	onTabChange: (tab: TProfileTab) => void;
};

export default function ProfileMobileNavigation({
	activeTab,
	copy,
	onTabChange,
}: TProfileMobileNavigationProps) {
	const navigationItems = [
		{
			label: copy.sidebar.profile,
			tab: 'profile',
			active: activeTab === 'profile',
		},
		{
			label: copy.sidebar.orders,
			tab: 'orders',
			active: activeTab === 'orders',
		},
		{
			label: copy.bookings,
			tab: 'bookings',
			active: activeTab === 'bookings',
		},
		{
			label: copy.sidebar.favorites,
			tab: 'favorites',
			active: activeTab === 'favorites',
		},
		{
			label: copy.sidebar.bonuses,
			tab: 'bonuses',
			active: activeTab === 'bonuses',
		},
		{
			label: copy.sidebar.settings,
			tab: 'settings',
			active: activeTab === 'settings',
		},
	] satisfies {
		label: string;
		tab: TProfileTab;
		active: boolean;
	}[];

	return (
		<nav
			aria-label={copy.title}
			className='mt-6 grid grid-cols-3 gap-1 border-b border-[#e2d7cc] lg:hidden'
		>
			{navigationItems.map(item => (
				<button
					key={item.label}
					type='button'
					onClick={() => onTabChange(item.tab)}
					className={
						'flex min-h-11 cursor-pointer items-center justify-center border-b-2 px-1.5 pb-2 text-center text-[11px] leading-tight transition sm:px-3 sm:text-sm ' +
						(item.active
							? 'border-[var(--accent)] font-semibold text-[var(--foreground)]'
							: 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]')
					}
				>
					{item.label}
				</button>
			))}
		</nav>
	);
}
