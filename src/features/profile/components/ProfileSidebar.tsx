import Image from 'next/image';
import Link from 'next/link';
import {
	CalendarDays,
	CalendarRange,
	Gift,
	Heart,
	Settings,
	ShieldCheck,
	ShoppingBag,
	UserRound,
} from 'lucide-react';
import type { TProfileCopy } from '../profile-copy';
import type { TProfileLocale, TProfileTab } from '../types';
import LogoutButton from './LogoutButton';

type TProfileSidebarProps = {
	locale: TProfileLocale;
	isAdmin: boolean;
	activeTab: TProfileTab;
	copy: TProfileCopy;
	onTabChange: (tab: TProfileTab) => void;
};

export default function ProfileSidebar({
	locale,
	isAdmin,
	activeTab,
	copy,
	onTabChange,
}: TProfileSidebarProps) {
	const navigationItems = [
		{
			label: copy.sidebar.profile,
			tab: 'profile',
			icon: UserRound,
			active: activeTab === 'profile',
		},
		{
			label: copy.sidebar.orders,
			tab: 'orders',
			icon: ShoppingBag,
			active: activeTab === 'orders',
		},
		{
			label: copy.bookings,
			tab: 'bookings',
			icon: CalendarDays,
			active: activeTab === 'bookings',
		},
		{
			label: copy.sidebar.events,
			tab: 'events',
			icon: CalendarRange,
			active: activeTab === 'events',
		},
		{
			label: copy.sidebar.favorites,
			tab: 'favorites',
			icon: Heart,
			active: activeTab === 'favorites',
		},
		{
			label: copy.sidebar.bonuses,
			tab: 'bonuses',
			icon: Gift,
			active: activeTab === 'bonuses',
		},
		{
			label: copy.sidebar.settings,
			tab: 'settings',
			icon: Settings,
			active: activeTab === 'settings',
		},
	] satisfies {
		label: string;
		tab: TProfileTab;
		icon: typeof UserRound;
		active: boolean;
	}[];

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
						<button
							key={item.label}
							type='button'
							onClick={() => onTabChange(item.tab)}
							className={
								'group flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm transition-colors ' +
								(item.active
									? 'bg-white/14 font-semibold'
									: 'text-white/68 hover:bg-white/10 hover:text-white')
							}
						>
							<Icon size={17} strokeWidth={1.7} />
							<span>{item.label}</span>
						</button>
					);
				})}
			</nav>

			<div className='mt-auto space-y-1.5 border-t border-white/12 pt-5'>
				{isAdmin ? (
					<Link
						href={'/' + locale + '/admin'}
						className='flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white'
					>
						<ShieldCheck size={17} strokeWidth={1.7} />
						<span>{copy.adminPanel}</span>
					</Link>
				) : null}
				<LogoutButton
					locale={locale}
					label={copy.sidebar.logout}
				/>
			</div>
		</aside>
	);
}
