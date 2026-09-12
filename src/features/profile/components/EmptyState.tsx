import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

type TEmptyStateProps = {
	id?: string;
	icon: ReactNode;
	title: string;
	description: string;
	actionLabel: string;
	actionHref: string;
};

export default function EmptyState({
	id,
	icon,
	title,
	description,
	actionLabel,
	actionHref,
}: TEmptyStateProps) {
	return (
		<div
			id={id}
			className='mt-5 scroll-mt-4 overflow-hidden rounded-2xl border border-[#e5dcd3] bg-white/55'
		>
			<div className='flex flex-col items-center justify-center px-4 py-10 text-center sm:px-6 sm:py-12'>
				<div className='flex h-14 w-14 items-center justify-center rounded-full bg-[#efe4d8] text-[var(--accent)]'>
					{icon}
				</div>
				<h2 className='mt-4 text-lg font-semibold'>{title}</h2>
				<p className='mt-2 max-w-[360px] text-sm leading-6 text-[var(--muted)]'>
					{description}
				</p>
				<Link
					href={actionHref}
					className='mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg'
				>
					<span>{actionLabel}</span>
					<ArrowRight className='rtl:rotate-180' size={16} />
				</Link>
			</div>
		</div>
	);
}
