import Image from 'next/image';
import Link from 'next/link';
import {
	CalendarDays,
	Gift,
	Heart,
	Settings,
	ShoppingBag,
	UserRound,
} from 'lucide-react';
import type { TProfileCopy } from '../profile-copy';
import type { TProfileLocale, TProfileTab } from '../types';
import LogoutButton from './LogoutButton';

type TProfileSidebarProps = {
	locale: TProfileLocale;
	activeTab: TProfileTab;
	copy: TProfileCopy;
};

export default function ProfileSidebar({
	locale,
	activeTab,
	copy,
}: TProfileSidebarProps) {
	const navigationItems = [
		{
			label: copy.sidebar.profile,
			href: '?tab=profile#profile',
			icon: UserRound,
			active: activeTab === 'profile',
		},
		{
			label: copy.sidebar.orders,
			href: '?tab=orders#orders',
			icon: ShoppingBag,
			active: activeTab === 'orders',
		},
		{
			label: copy.bookings,
			href: '?tab=bookings#bookings',
			icon: CalendarDays,
			active: activeTab === 'bookings',
		},
		{
			label: copy.sidebar.favorites,
			href: '?tab=favorites#favorites',
			icon: Heart,
			active: activeTab === 'favorites',
		},
		{
			label: copy.sidebar.bonuses,
			href: '?tab=bonuses#bonuses',
			icon: Gift,
			active: activeTab === 'bonuses',
		},
		{
			label: copy.sidebar.settings,
			href: '?tab=settings#settings',
			icon: Settings,
			active: activeTab === 'settings',
		},
	];

	return (
		<aside className='hidden w-[230px] shrink-0 flex-col bg-[linear-gradient(160deg,#30231d,#4a3224)] p-5 text-white lg:flex'>
			<Link href={'/' + locale} className='mb-12 block'>
				<Image
					src='/brew-and-bloom-logo.png'
					alt='Brew & Bloom'
					width={145}
					height={49}
					className='h-auto w-[145px] brightness-0 invert'
				/>
			</Link>

			<nav aria-label={copy.title} className='space-y-1.5'>
				{navigationItems.map(item => {
					const Icon = item.icon;

					return (
						<a
							key={item.label}
							href={item.href}
							className={
								'group flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ' +
								(item.active
									? 'bg-white/14 font-semibold'
									: 'text-white/68 hover:bg-white/10 hover:text-white')
							}
						>
							<Icon size={17} strokeWidth={1.7} />
							<span>{item.label}</span>
						</a>
					);
				})}
			</nav>

			<div className='mt-auto border-t border-white/12 pt-5'>
				<LogoutButton
					locale={locale}
					label={copy.sidebar.logout}
				/>
			</div>
		</aside>
	);
}
