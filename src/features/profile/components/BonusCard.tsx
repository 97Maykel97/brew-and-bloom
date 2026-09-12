import { ChevronRight, Gift } from 'lucide-react';
import type { TProfileCopy } from '../profile-copy';

type TBonusCardProps = {
	copy: TProfileCopy;
	bonusPoints: number;
	onOpen: () => void;
};

export default function BonusCard({
	copy,
	bonusPoints,
	onOpen,
}: TBonusCardProps) {
	return (
		<div
			id='bonus-summary'
			className='relative scroll-mt-4 overflow-hidden rounded-2xl bg-[#efe4d8] px-4 py-4 sm:px-7 sm:py-6'
		>
			<div className='absolute -right-8 -top-12 h-36 w-36 rounded-full bg-white/28 blur-2xl' />
			<div className='relative flex items-center justify-between gap-3'>
				<div className='flex min-w-0 items-center gap-3 sm:gap-4'>
					<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f8f3ec] text-[var(--accent)] shadow-sm sm:h-12 sm:w-12'>
						<Gift size={22} strokeWidth={1.6} />
					</div>
					<div className='min-w-0'>
						<p className='truncate text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--muted)] sm:text-xs sm:tracking-[0.14em]'>
							{copy.bonusTitle}
						</p>
						<p className='mt-1 text-base font-semibold sm:text-lg'>
							{copy.bonusText}{' '}
							<span className='text-[var(--accent)]'>{bonusPoints}</span>{' '}
							{copy.bonuses}
						</p>
					</div>
				</div>

				<button
					type='button'
					onClick={onOpen}
					aria-label={copy.bonusLink}
					className='flex min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center gap-1 text-xs text-[var(--muted)] transition hover:text-[var(--foreground)]'
				>
					<span className='hidden sm:inline'>{copy.bonusLink}</span>
					<ChevronRight className='rtl:rotate-180' size={15} />
				</button>
			</div>
		</div>
	);
}
