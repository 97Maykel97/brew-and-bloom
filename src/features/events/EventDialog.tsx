import { CalendarDays, Clock3, LoaderCircle, MapPin, Minus, Plus, UsersRound, X } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';

import type { TProfileLocale } from '@/features/profile/types';
import type { TEventsCopy } from './events-copy';
import { formatEventDate, formatEventTime, getEventImage, getLocalizedEventText } from './event-utils';
import type { TEventRegistration, TPublicEvent } from './types';

type TEventDialogProps = {
	copy: TEventsCopy;
	event: TPublicEvent;
	guestCount: number;
	isPending: boolean;
	isSignedIn: boolean;
	locale: TProfileLocale;
	message: string;
	onCancel: (registration: TEventRegistration) => void;
	onClose: () => void;
	onGuestCountChange: (value: number) => void;
	onOpenProfile: () => void;
	onRegister: (event: TPublicEvent) => void;
	registration?: TEventRegistration;
};

export default function EventDialog({
	copy,
	event,
	guestCount,
	isPending,
	isSignedIn,
	locale,
	message,
	onCancel,
	onClose,
	onGuestCountChange,
	onOpenProfile,
	onRegister,
	registration,
}: TEventDialogProps) {
	const maxGuests = Math.max(1, Math.min(10, event.available_spots));
	const title = getLocalizedEventText(event, 'title', locale);

	return (
		<div
			aria-modal='true'
			className='fixed inset-0 z-[300] flex items-end justify-center bg-[#21160f]/55 backdrop-blur-sm sm:items-center sm:p-5'
			onMouseDown={mouseEvent => {
				if (mouseEvent.target === mouseEvent.currentTarget) onClose();
			}}
			role='dialog'
		>
			<div className='max-h-[92svh] w-full overflow-y-auto rounded-t-[30px] bg-[#fffaf5] shadow-2xl sm:max-w-2xl sm:rounded-[30px]'>
				<div className='relative aspect-[16/7] min-h-48 overflow-hidden'>
					<Image alt={title} className='object-cover' fill sizes='672px' src={getEventImage(event)} />
					<button
						aria-label={copy.close}
						className='absolute end-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-[var(--foreground)]'
						onClick={onClose}
						type='button'
					>
						<X size={18} />
					</button>
				</div>

				<div className='p-5 sm:p-7'>
					<span className='rounded-full bg-[#efe2d5] px-3 py-1.5 text-xs font-bold text-[#725542]'>
						{copy.types[event.event_type]}
					</span>
					<h2 className='mt-4 font-serif text-4xl leading-tight'>{title}</h2>
					<p className='mt-4 text-sm leading-7 text-[var(--muted)]'>
						{getLocalizedEventText(event, 'description', locale)}
					</p>

					<div className='mt-5 grid gap-3 rounded-2xl bg-[#f3e8dc] p-4 sm:grid-cols-3'>
						<Meta icon={<CalendarDays size={16} />} label={copy.date} value={formatEventDate(event.event_date, locale)} />
						<Meta icon={<Clock3 size={16} />} label={copy.time} value={formatEventTime(event)} />
						<Meta icon={<UsersRound size={16} />} label={copy.spots} value={String(event.available_spots)} />
					</div>

					{message ? (
						<p className='mt-4 rounded-xl bg-[#edf3e9] px-4 py-3 text-sm text-[#526c48]'>{message}</p>
					) : null}

					{registration ? (
						<RegistrationActions
							copy={copy}
							isPending={isPending}
							onCancel={() => onCancel(registration)}
							onOpenProfile={onOpenProfile}
							registration={registration}
						/>
					) : (
						<RegistrationForm
							copy={copy}
							event={event}
							guestCount={guestCount}
							isPending={isPending}
							isSignedIn={isSignedIn}
							maxGuests={maxGuests}
							onGuestCountChange={onGuestCountChange}
							onRegister={() => onRegister(event)}
						/>
					)}
				</div>
			</div>
		</div>
	);
}

function RegistrationActions({ copy, isPending, onCancel, onOpenProfile, registration }: {
	copy: TEventsCopy;
	isPending: boolean;
	onCancel: () => void;
	onOpenProfile: () => void;
	registration: TEventRegistration;
}) {
	return (
		<div className='mt-5 flex flex-col gap-3 rounded-2xl border border-[#d9d0c8] p-4 sm:flex-row sm:items-center sm:justify-between'>
			<div>
				<p className='text-xs text-[var(--muted)]'>{copy.myRegistration}</p>
				<p className='mt-1 font-semibold'>{copy.statuses[registration.status]} · {registration.guest_count}</p>
			</div>
			<div className='flex flex-wrap gap-2'>
				<button className='cursor-pointer rounded-full bg-[var(--accent)] px-4 py-2.5 text-xs font-bold text-white' onClick={onOpenProfile} type='button'>
					{copy.openProfile}
				</button>
				<button className='cursor-pointer rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 disabled:cursor-wait disabled:opacity-50' disabled={isPending} onClick={onCancel} type='button'>
					{isPending ? copy.cancelling : copy.cancel}
				</button>
			</div>
		</div>
	);
}

function RegistrationForm({ copy, event, guestCount, isPending, isSignedIn, maxGuests, onGuestCountChange, onRegister }: {
	copy: TEventsCopy;
	event: TPublicEvent;
	guestCount: number;
	isPending: boolean;
	isSignedIn: boolean;
	maxGuests: number;
	onGuestCountChange: (value: number) => void;
	onRegister: () => void;
}) {
	return (
		<div className='mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
			<div>
				<p className='mb-2 text-xs font-semibold text-[var(--muted)]'>{copy.guests}</p>
				<div className='flex items-center gap-3'>
					<StepperButton disabled={guestCount <= 1} onClick={() => onGuestCountChange(Math.max(1, guestCount - 1))}>
						<Minus size={16} />
					</StepperButton>
					<strong className='min-w-8 text-center text-lg'>{guestCount}</strong>
					<StepperButton disabled={guestCount >= maxGuests || event.available_spots === 0} onClick={() => onGuestCountChange(Math.min(maxGuests, guestCount + 1))}>
						<Plus size={16} />
					</StepperButton>
				</div>
			</div>
			<button
				className='inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50'
				disabled={isPending || event.available_spots === 0}
				onClick={onRegister}
				type='button'
			>
				{isPending ? <LoaderCircle className='animate-spin' size={16} /> : <MapPin size={16} />}
				{event.available_spots === 0 ? copy.full : isSignedIn ? copy.register : copy.signIn}
			</button>
		</div>
	);
}

function StepperButton({ children, disabled, onClick }: { children: ReactNode; disabled: boolean; onClick: () => void }) {
	return (
		<button
			className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#d8cabd] bg-white disabled:cursor-not-allowed disabled:opacity-40'
			disabled={disabled}
			onClick={onClick}
			type='button'
		>
			{children}
		</button>
	);
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
	return (
		<div>
			<p className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]'>{icon}{label}</p>
			<p className='mt-2 text-sm font-bold'>{value}</p>
		</div>
	);
}
