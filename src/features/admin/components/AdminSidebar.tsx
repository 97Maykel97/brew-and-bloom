import Image from 'next/image';
import Link from 'next/link';
import { UserRound } from 'lucide-react';

import type { TAdminCopy, TAdminLocale, TAdminSection } from '../types';
import AdminLogoutButton from './AdminLogoutButton';
import { adminNavigationItems } from './admin-navigation';

type TAdminSidebarProps = {
	locale: TAdminLocale;
	activeSection: TAdminSection;
	copy: TAdminCopy;
	onSectionChange: (section: TAdminSection) => void;
};

export default function AdminSidebar({
	locale,
	activeSection,
	copy,
	onSectionChange,
}: TAdminSidebarProps) {
	return (
		<aside className='hidden w-[240px] shrink-0 flex-col bg-[linear-gradient(160deg,#30231d,#4a3224)] p-5 text-white lg:flex'>
			<Link href={'/' + locale} className='mb-10 block'>
				<Image
					src='/brew-and-bloom-logo.png'
					alt='Brew & Bloom'
					width={145}
					height={49}
					className='h-auto w-[145px] brightness-0 invert'
				/>
			</Link>

			<p className='mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45'>
				{copy.administrator}
			</p>

			<nav aria-label={copy.navigationLabel} className='space-y-1.5'>
				{adminNavigationItems.map(item => {
					const Icon = item.icon;
					const isActive = activeSection === item.section;

					return (
						<button
							key={item.section}
							type='button'
							onClick={() => onSectionChange(item.section)}
							className={
								'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm transition-colors ' +
								(isActive
									? 'bg-white/14 font-semibold text-white'
									: 'text-white/68 hover:bg-white/10 hover:text-white')
							}
						>
							<Icon size={17} strokeWidth={1.7} />
							<span>{copy.navigation[item.section]}</span>
						</button>
					);
				})}
			</nav>

			<div className='mt-auto space-y-1.5 border-t border-white/12 pt-5'>
				<Link
					href={'/' + locale + '/profile'}
					className='flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white'
				>
					<UserRound size={17} strokeWidth={1.7} />
					<span>{copy.profile}</span>
				</Link>
				<AdminLogoutButton locale={locale} label={copy.logout} />
			</div>
		</aside>
	);
}
