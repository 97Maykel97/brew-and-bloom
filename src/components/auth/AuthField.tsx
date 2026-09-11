import type { InputHTMLAttributes } from 'react';

type TAuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	label: string;
};

export const authInputClassName =
	'h-11 w-full rounded-xl border border-[var(--border)] bg-white/75 px-3.5 text-[15px] text-[var(--foreground)] outline-none transition duration-200 placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:bg-white focus:ring-4 focus:ring-[var(--accent)]/10 disabled:cursor-not-allowed disabled:opacity-60 sm:h-12 sm:rounded-2xl sm:px-4';

export default function AuthField({
	label,
	id,
	type,
	...inputProps
}: TAuthFieldProps) {
	const isLtr = type === 'email' || type === 'tel' || type === 'date';

	return (
		<label htmlFor={id} className='block space-y-1.5'>
			<span className='block text-sm font-medium text-[var(--foreground)]'>
				{label}
			</span>
			<input
				id={id}
				type={type}
				dir={isLtr ? 'ltr' : undefined}
				className={authInputClassName}
				{...inputProps}
			/>
		</label>
	);
}
