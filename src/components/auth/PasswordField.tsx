'use client';

import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { authInputClassName } from './AuthField';

type TPasswordFieldProps = Omit<
	InputHTMLAttributes<HTMLInputElement>,
	'type'
> & {
	label: string;
	showPasswordLabel: string;
	hidePasswordLabel: string;
};

export default function PasswordField({
	label,
	id,
	showPasswordLabel,
	hidePasswordLabel,
	...inputProps
}: TPasswordFieldProps) {
	const [isVisible, setIsVisible] = useState<boolean>(false);

	return (
		<label htmlFor={id} className='block space-y-1.5'>
			<span className='block text-sm font-medium text-[var(--foreground)]'>
				{label}
			</span>
			<span className='relative block'>
				<input
					id={id}
					type={isVisible ? 'text' : 'password'}
					className={authInputClassName + ' pr-12'}
					{...inputProps}
				/>
				<button
					type='button'
					aria-label={isVisible ? hidePasswordLabel : showPasswordLabel}
					onClick={() => setIsVisible(value => !value)}
					className='absolute inset-y-0 right-2 flex w-10 cursor-pointer items-center justify-center rounded-xl text-[var(--muted)] transition-colors hover:text-[var(--foreground)]'
				>
					{isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
				</button>
			</span>
		</label>
	);
}
