import { Coffee, Pencil } from 'lucide-react';
import type { TProfileCopy } from '../profile-copy';

type TProfileHeaderProps = {
	copy: TProfileCopy;
	displayName: string;
	onEdit: () => void;
	showEdit: boolean;
};

export default function ProfileHeader({
	copy,
	displayName,
	onEdit,
	showEdit,
}: TProfileHeaderProps) {
	return (
		<div
			id='profile'
			className='mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between'
		>
			<div className='min-w-0'>
				<p className='text-sm text-[var(--muted)]'>{copy.title}</p>
				<h1 className='mt-2 break-words text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-4xl'>
					<span className='block'>{copy.welcome},</span>
					<span className='mt-1 block [font-family:var(--font-heading)]'>
						{displayName}
					</span>
				</h1>
				<p className='mt-2 text-sm text-[var(--muted)]'>
					{copy.greeting}{' '}
					<Coffee
						className='inline-block align-[-3px]'
						size={15}
						strokeWidth={1.8}
					/>
				</p>
			</div>

			{showEdit ? (
				<button
					type='button'
					onClick={onEdit}
					className='inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 self-start rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:min-h-10 sm:w-auto sm:self-auto'
				>
					<Pencil size={15} strokeWidth={1.8} />
					<span>{copy.edit}</span>
				</button>
			) : null}
		</div>
	);
}
