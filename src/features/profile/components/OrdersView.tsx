import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import type { TProfileCopy } from '../profile-copy';
import type { TOrderStatus, TProfileLocale } from '../types';
import EmptyState from './EmptyState';

type TOrdersViewProps = {
	locale: TProfileLocale;
	activeStatus: TOrderStatus;
	copy: TProfileCopy;
};

export default function OrdersView({
	locale,
	activeStatus,
	copy,
}: TOrdersViewProps) {
	const statusItems = [
		{ value: 'all', label: copy.allOrders },
		{ value: 'processing', label: copy.processingOrders },
		{ value: 'ready', label: copy.readyOrders },
		{ value: 'completed', label: copy.completedOrders },
	] as const;

	return (
		<>
			<div className='mt-5 flex gap-2 overflow-x-auto rounded-xl bg-[#efe4d8] p-1'>
				{statusItems.map(item => (
					<Link
						key={item.value}
						href={'?tab=orders&status=' + item.value + '#orders'}
						aria-current={activeStatus === item.value ? 'page' : undefined}
						className={
							'inline-flex min-h-9 shrink-0 items-center justify-center rounded-lg px-4 text-xs font-medium transition ' +
							(activeStatus === item.value
								? 'bg-[#f8f3ec] text-[var(--foreground)] shadow-sm'
								: 'text-[var(--muted)] hover:text-[var(--foreground)]')
						}
					>
						{item.label}
					</Link>
				))}
			</div>

			<EmptyState
				icon={<ShoppingBag size={24} strokeWidth={1.6} />}
				title={copy.emptyOrders}
				description={copy.emptyOrdersText}
				actionLabel={copy.explore}
				actionHref={'/' + locale + '/menu'}
			/>

			<div className='relative mt-6 min-h-[190px] overflow-hidden rounded-2xl bg-[#4a3224] text-white'>
				<Image
					src='/cafe-hero-background.png'
					alt=''
					fill
					sizes='(max-width: 640px) 100vw, 920px'
					className='object-cover object-center opacity-45'
				/>
				<div className='absolute inset-0 bg-gradient-to-r from-[#2f211a]/90 via-[#4a3224]/55 to-transparent' />
				<div className='relative max-w-[470px] px-6 py-7 sm:px-8'>
					<p className='text-xl leading-tight [font-family:var(--font-heading)] sm:text-2xl'>
						{copy.promoTitle}
					</p>
					<p className='mt-2 text-sm leading-5 text-white/72'>
						{copy.promoText}
					</p>
					<Link
						href={'/' + locale + '/menu'}
						className='mt-5 inline-flex min-h-9 items-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-[var(--accent)] transition hover:bg-[#f5eee6]'
					>
						<span>{copy.promoButton}</span>
						<ArrowRight className='rtl:rotate-180' size={14} />
					</Link>
				</div>
			</div>
		</>
	);
}
