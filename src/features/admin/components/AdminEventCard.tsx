import { Eye, EyeOff, LoaderCircle, Pencil, Trash2 } from 'lucide-react';

import type { TAdminLocale } from '../types';
import type { TAdminEvent, TAdminEventsCopy } from '../lib/admin-events-config';

type TAdminEventCardProps = {
	copy: TAdminEventsCopy;
	event: TAdminEvent;
	isPending: boolean;
	locale: TAdminLocale;
	onDelete: () => void;
	onEdit: () => void;
	onToggle: () => void;
};

export default function AdminEventCard({
	copy,
	event,
	isPending,
	locale,
	onDelete,
	onEdit,
	onToggle,
}: TAdminEventCardProps) {
	const title = event[`title_${locale}`] || event.title_ru;
	const description = event[`description_${locale}`] || event.description_ru;
	const localeCode = locale === 'ru' ? 'ru-RU' : locale === 'he' ? 'he-IL' : 'en-GB';
	const formattedDate = new Intl.DateTimeFormat(localeCode, {
		day: 'numeric', month: 'long', year: 'numeric',
	}).format(new Date(`${event.event_date}T12:00:00`));

	return (
		<article className={`rounded-2xl border p-4 transition sm:p-5 ${event.is_published ? 'border-[#dfd2c5] bg-white/80' : 'border-[#ddd7d1] bg-[#f0edeb]/80'}`}>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div className='min-w-0'>
					<div className='flex flex-wrap items-center gap-2'>
						<span className='rounded-full bg-[#efe2d5] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#725542]'>{copy.types[event.event_type]}</span>
						<span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${event.is_published ? 'bg-[#e7f0e2] text-[#526c48]' : 'bg-[#ece8e4] text-[#756c65]'}`}>{event.is_published ? <Eye size={12} /> : <EyeOff size={12} />}{event.is_published ? copy.published : copy.hidden}</span>
					</div>
					<h3 className='mt-3 text-lg font-semibold'>{title}</h3>
					<p className='mt-1 text-sm font-medium text-[#725542]'>{formattedDate} · <bdi>{event.start_time.slice(0, 5)}–{event.end_time.slice(0, 5)}</bdi></p>
					<p className='mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]'>{description}</p>
				</div>
				<div className='flex shrink-0 flex-wrap gap-2'>
					<IconButton label={event.is_published ? copy.hidden : copy.published} onClick={onToggle} disabled={isPending}>{event.is_published ? <EyeOff size={16} /> : <Eye size={16} />}</IconButton>
					<IconButton label={copy.edit} onClick={onEdit} disabled={isPending} accent><Pencil size={16} /></IconButton>
					<IconButton label={copy.delete} onClick={onDelete} disabled={isPending} danger>{isPending ? <LoaderCircle className='animate-spin' size={16} /> : <Trash2 size={16} />}</IconButton>
				</div>
			</div>
		</article>
	);
}

function IconButton({ accent = false, children, danger = false, disabled, label, onClick }: { accent?: boolean; children: React.ReactNode; danger?: boolean; disabled: boolean; label: string; onClick: () => void }) {
	const tone = danger ? 'border-red-200 bg-red-50 text-red-600' : accent ? 'border-[#d8cabd] bg-white text-[var(--accent)]' : 'border-[#d8cabd] bg-white text-[var(--muted)]';
	return <button aria-label={label} className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border disabled:cursor-wait disabled:opacity-50 ${tone}`} disabled={disabled} onClick={onClick} type='button'>{children}</button>;
}
