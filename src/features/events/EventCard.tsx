import { CheckCircle2, Clock3 } from 'lucide-react';
import Image from 'next/image';

import type { TProfileLocale } from '@/features/profile/types';
import type { TEventsCopy } from './events-copy';
import { formatEventDate, formatEventTime, getEventImage, getLocalizedEventText } from './event-utils';
import type { TEventRegistration, TPublicEvent } from './types';

type TEventCardProps = {
	copy: TEventsCopy;
	event: TPublicEvent;
	locale: TProfileLocale;
	onOpen: () => void;
	registration?: TEventRegistration;
};

export default function EventCard({
	copy,
	event,
	locale,
	onOpen,
	registration,
}: TEventCardProps) {
	const title = getLocalizedEventText(event, 'title', locale);

	return (
		<article className='group flex h-full min-h-[550px] flex-col overflow-hidden rounded-3xl border border-[#dfd2c5] bg-white/80 shadow-[0_16px_40px_rgba(63,43,31,0.07)]'>
			<div className='relative aspect-[4/3] shrink-0 overflow-hidden'>
				<Image
					alt={title}
					className='object-cover transition duration-500 group-hover:scale-[1.035]'
					fill
					sizes='(max-width: 767px) 100vw, 33vw'
					src={getEventImage(event)}
				/>
				<span className='absolute start-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#725542] backdrop-blur'>
					{copy.types[event.event_type]}
				</span>
				{registration ? (
					<span className='absolute end-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#e7f0e2] px-3 py-1.5 text-xs font-bold text-[#526c48]'>
						<CheckCircle2 size={13} />
						{copy.statuses[registration.status]}
					</span>
				) : null}
			</div>

			<div className='flex flex-1 flex-col p-5'>
				<p className='text-xs font-bold uppercase tracking-[0.1em] text-[#8a6d5a]'>
					{formatEventDate(event.event_date, locale)}
				</p>
				<h2 className='mt-2 line-clamp-2 min-h-[2.5em] font-serif text-3xl leading-tight'>
					{title}
				</h2>
				<p className='mt-3 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[var(--muted)]'>
					{getLocalizedEventText(event, 'description', locale)}
				</p>
				<div className='mt-auto flex items-center justify-between gap-3 pt-5'>
					<span className='inline-flex items-center gap-2 text-xs font-semibold text-[#725542]'>
						<Clock3 size={15} />
						<bdi>{formatEventTime(event)}</bdi>
					</span>
					<button
						className='cursor-pointer rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white transition hover:-translate-y-0.5'
						onClick={onOpen}
						type='button'
					>
						{copy.details}
					</button>
				</div>
			</div>
		</article>
	);
}
