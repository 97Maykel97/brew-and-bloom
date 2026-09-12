import { Gift } from 'lucide-react';

import type { TProfileCopy } from '../profile-copy';
import type { TProfileViewModel } from '../types';

type TBonusViewProps = {
	copy: TProfileCopy;
	profile: TProfileViewModel;
};

export default function BonusView({
	copy,
	profile,
}: TBonusViewProps) {
	return (
		<section
			id='bonuses'
			className='mt-5 scroll-mt-4 rounded-2xl border border-[#e5dcd3] bg-white/70 px-5 py-10 text-center sm:px-8 sm:py-12'
		>
			<div className='mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#efe4d8] text-[var(--accent)]'>
				<Gift size={25} strokeWidth={1.6} />
			</div>
			<p className='mt-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--muted)]'>
				{copy.bonusTitle}
			</p>
			<h2 className='mt-2 text-2xl font-semibold'>
				{copy.bonusText}{' '}
				<span className='text-[var(--accent)]'>
					{profile.bonusPoints}
				</span>{' '}
				{copy.bonuses}
			</h2>
			<p className='mx-auto mt-3 max-w-[440px] text-sm leading-6 text-[var(--muted)]'>
				{copy.bonusDescription}
			</p>
		</section>
	);
}
