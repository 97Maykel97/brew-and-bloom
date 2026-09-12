import {
	ChevronRight,
	LockKeyhole,
	Mail,
	Phone,
	Trash2,
	UserRound,
} from 'lucide-react';
import { getInitials } from '../lib/profile-formatters';
import type { TProfileCopy } from '../profile-copy';
import type { TProfileViewModel } from '../types';

type TProfileDetailsProps = {
	copy: TProfileCopy;
	profile: TProfileViewModel;
};

export default function ProfileDetails({
	copy,
	profile,
}: TProfileDetailsProps) {
	const initials = getInitials(profile.fullName);

	return (
		<div className='mt-5 space-y-4' id='personal-data'>
			<div className='rounded-2xl border border-[#e5dcd3] bg-white/80 p-4 sm:p-8'>
				<div className='flex items-center gap-4 sm:gap-7'>
					<div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e7d7c8] text-xl font-medium text-[var(--accent)] shadow-[inset_0_0_0_1px_rgba(77,53,40,0.05)] sm:h-24 sm:w-24 sm:text-2xl'>
						{initials || <UserRound size={32} strokeWidth={1.5} />}
					</div>
					<div className='min-w-0'>
						<h2 className='truncate text-xl font-semibold sm:text-2xl'>
							{profile.displayName}
						</h2>
						<div className='mt-3 flex min-w-0 items-center gap-2 text-sm text-[var(--muted)]'>
							<Mail size={17} className='shrink-0' strokeWidth={1.7} />
							<span className='truncate'>{profile.email}</span>
						</div>
						<div className='mt-2 flex items-center gap-2 text-sm text-[var(--muted)]'>
							<Phone size={17} className='shrink-0' strokeWidth={1.7} />
							<span>{profile.phone}</span>
						</div>
					</div>
				</div>

				<div className='mt-6 rounded-xl bg-[#fcfaf7] px-3 py-2 shadow-[0_8px_30px_rgba(55,39,28,0.035)] sm:mt-8 sm:px-6'>
					<div className='flex min-h-14 items-center gap-3 border-b border-[#eee5dc]'>
						<UserRound
							size={19}
							className='shrink-0 text-[var(--accent)]'
							strokeWidth={1.7}
						/>
						<span className='text-sm font-semibold'>{copy.personalData}</span>
						<ChevronRight className='ms-auto rtl:rotate-180' size={18} />
					</div>
					<dl className='grid grid-cols-[minmax(72px,0.65fr)_minmax(0,1.35fr)] gap-x-3 gap-y-4 py-5 text-sm sm:grid-cols-[minmax(130px,0.75fr)_minmax(0,1.25fr)] sm:gap-x-5'>
						<dt className='text-[var(--muted)]'>{copy.name}</dt>
						<dd className='truncate font-medium'>{profile.displayName}</dd>
						<dt className='text-[var(--muted)]'>{copy.email}</dt>
						<dd className='truncate font-medium'>{profile.email}</dd>
						<dt className='text-[var(--muted)]'>{copy.phone}</dt>
						<dd className='font-medium'>{profile.phone}</dd>
						<dt className='text-[var(--muted)]'>{copy.birthDate}</dt>
						<dd className='font-medium'>{profile.birthDate}</dd>
					</dl>
				</div>
			</div>

			<div id='settings' className='scroll-mt-4 space-y-4'>
				<a
					href='#personal-data'
					className='flex min-h-14 items-center gap-3 rounded-xl border border-[#e5dcd3] bg-white/70 px-4 text-sm font-semibold transition hover:bg-white sm:px-5'
				>
					<LockKeyhole
						size={19}
						className='text-[var(--accent)]'
						strokeWidth={1.7}
					/>
					<span>{copy.changePassword}</span>
					<ChevronRight className='ms-auto rtl:rotate-180' size={18} />
				</a>
				<a
					href='#personal-data'
					className='flex min-h-14 items-center gap-3 rounded-xl border border-red-100 bg-red-50/45 px-4 text-sm font-semibold text-red-500 transition hover:bg-red-50 sm:px-5'
				>
					<Trash2 size={19} strokeWidth={1.7} />
					<span>{copy.deleteAccount}</span>
					<ChevronRight className='ms-auto rtl:rotate-180' size={18} />
				</a>
			</div>
		</div>
	);
}
