import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import LanguageSwitcher from '@/components/UI/LanguageSwitcher';
import type { TProfileLocale } from '../types';

type TProfileTopBarProps = {
	homeLabel: string;
	locale: TProfileLocale;
};

export default function ProfileTopBar({
	homeLabel,
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

			<LanguageSwitcher locale={locale} />
		</div>
	);
}
