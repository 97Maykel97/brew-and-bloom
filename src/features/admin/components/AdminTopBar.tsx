import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, UserRound } from 'lucide-react';

import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import type { TAdminLocale } from '../types';

type TAdminTopBarProps = {
	homeLabel: string;
	profileLabel: string;
	locale: TAdminLocale;
};

export default function AdminTopBar({
	homeLabel,
	profileLabel,
	locale,
}: TAdminTopBarProps) {
	return (
		<div className='flex items-center justify-between gap-3 border-b border-[#e8ddd2] px-4 py-3 sm:px-8 sm:py-4 lg:px-10'>
			<div className='flex min-w-0 items-center gap-3'>
				<Link
					href={'/' + locale}
					aria-label='Brew & Bloom'
					className='shrink-0 lg:hidden'
				>
					<Image
						src='/brew-and-bloom-logo.png'
						alt='Brew & Bloom'
						width={122}
						height={41}
						className='h-auto w-[98px] sm:w-[122px]'
					/>
				</Link>

				<Link
					href={'/' + locale}
					className='inline-flex min-h-10 shrink-0 items-center gap-1 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)] sm:text-sm'
				>
					<ArrowRight
						className='rtl:rotate-180'
						size={17}
						strokeWidth={1.8}
					/>
					<span>{homeLabel}</span>
				</Link>
			</div>

			<div className='flex shrink-0 items-center gap-1 sm:gap-2'>
				<Link
					href={'/' + locale + '/profile'}
					aria-label={profileLabel}
					title={profileLabel}
					className='inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--foreground)] transition hover:bg-[#efe4d8] lg:hidden'
				>
					<UserRound size={19} strokeWidth={1.8} />
				</Link>
				<LanguageSwitcher locale={locale} />
			</div>
		</div>
	);
}
