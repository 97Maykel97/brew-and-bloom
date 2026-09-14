import {
	CalendarDays,
	Inbox,
	ShoppingBag,
	UtensilsCrossed,
	UsersRound,
} from 'lucide-react';

import type { TAdminCopy } from '../types';

type TAdminOverviewProps = {
	copy: TAdminCopy;
};

export default function AdminOverview({ copy }: TAdminOverviewProps) {
	const statistics = [
		{ label: copy.overview.orders, icon: ShoppingBag },
		{ label: copy.overview.bookings, icon: CalendarDays },
		{ label: copy.overview.users, icon: UsersRound },
		{ label: copy.overview.menuItems, icon: UtensilsCrossed },
	];

	return (
		<div className='space-y-5 sm:space-y-6'>
			<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
				{statistics.map(item => {
					const Icon = item.icon;

					return (
						<article
							key={item.label}
							className='rounded-2xl border border-[#e4d8cd] bg-white/75 p-4 shadow-[0_10px_30px_rgba(61,43,31,0.04)] sm:p-5'
						>
							<div className='mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#f1e5d8] text-[var(--accent)]'>
								<Icon size={19} strokeWidth={1.7} />
							</div>
							<strong className='block text-2xl font-semibold'>—</strong>
							<span className='mt-1 block text-sm text-[var(--muted)]'>
								{item.label}
							</span>
						</article>
					);
				})}
			</div>

			<section className='rounded-3xl border border-[#e4d8cd] bg-white/75 p-5 sm:p-7'>
				<h2 className='text-lg font-semibold sm:text-xl'>
					{copy.overview.recentActivity}
				</h2>
				<div className='mt-5 flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-[#dccfc2] bg-[#fbf8f4] px-5 text-center'>
					<div className='flex h-12 w-12 items-center justify-center rounded-full bg-[#f1e5d8] text-[var(--accent)]'>
						<Inbox size={21} strokeWidth={1.7} />
					</div>
					<p className='mt-4 max-w-md text-sm text-[var(--muted)]'>
						{copy.overview.emptyActivity}
					</p>
				</div>
			</section>
		</div>
	);
}
