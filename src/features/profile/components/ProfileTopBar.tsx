import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import type { TProfileLocale } from '../types';

type TProfileTopBarProps = {
	adminLabel: string;
	adminShortLabel: string;
	homeLabel: string;
	isAdmin: boolean;
	locale: TProfileLocale;
};

export default function ProfileTopBar({
	adminLabel,
	adminShortLabel,
	homeLabel,
	isAdmin,
	locale,
}: TProfileTopBarProps) {
	return (
		<div className='flex items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-8 sm:py-4 lg:px-12 lg:pb-0 lg:pt-6'>
			<div className='flex min-w-0 items-center gap-2 sm:gap-3'>
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
						className='h-auto w-[92px] min-[360px]:w-[104px] sm:w-[122px]'
					/>
				</Link>

				<Link
					href={'/' + locale}
					className='inline-flex h-10 shrink-0 items-center gap-1 rounded-full text-[11px] text-[var(--muted)] transition hover:text-[var(--foreground)] min-[360px]:text-xs sm:text-sm'
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
				{isAdmin ? (
					<Link
						href={'/' + locale + '/admin'}
						aria-label={adminLabel}
						title={adminLabel}
						className='inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-[#d8ccc0] bg-white/55 px-2.5 text-[11px] font-semibold text-[var(--foreground)] transition hover:bg-[#efe4d8] lg:hidden'
					>
						<ShieldCheck size={16} strokeWidth={1.8} />
						<span>{adminShortLabel}</span>
					</Link>
				) : null}
				<LanguageSwitcher locale={locale} />
			</div>
		</div>
	);
}
