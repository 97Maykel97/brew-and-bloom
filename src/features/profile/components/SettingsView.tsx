import Link from 'next/link';
import { LockKeyhole, Settings } from 'lucide-react';

import type { TProfileCopy } from '../profile-copy';
import type { TProfileLocale } from '../types';
import LogoutButton from './LogoutButton';

type TSettingsViewProps = {
	copy: TProfileCopy;
	locale: TProfileLocale;
};

export default function SettingsView({
	copy,
	locale,
}: TSettingsViewProps) {
	return (
		<section
			id='settings'
			className='mt-5 scroll-mt-4 rounded-2xl border border-[#e5dcd3] bg-white/70 p-4 sm:p-6'
		>
			<div className='flex items-start gap-3'>
				<div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#efe4d8] text-[var(--accent)]'>
					<Settings size={21} strokeWidth={1.7} />
				</div>
				<div>
					<h2 className='text-lg font-semibold'>
						{copy.sidebar.settings}
					</h2>
					<p className='mt-1 text-sm leading-6 text-[var(--muted)]'>
						{copy.settingsDescription}
					</p>
				</div>
			</div>

			<div className='mt-6 space-y-3'>
				<Link
					href={'/' + locale + '/auth/forgot-password'}
					className='flex min-h-14 items-center gap-3 rounded-xl border border-[#e5dcd3] bg-[#fcfaf7] px-4 text-sm font-semibold transition hover:bg-white sm:px-5'
				>
					<LockKeyhole
						size={19}
						className='text-[var(--accent)]'
						strokeWidth={1.7}
					/>
					<span>{copy.changePassword}</span>
				</Link>

				<LogoutButton
					label={copy.sidebar.logout}
					locale={locale}
					variant='card'
				/>
			</div>
		</section>
	);
}
