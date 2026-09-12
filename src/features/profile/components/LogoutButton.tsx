'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import type { TProfileLocale } from '../types';

type TLogoutButtonProps = {
	label: string;
	locale: TProfileLocale;
	variant?: 'card' | 'sidebar';
};

export default function LogoutButton({
	label,
	locale,
	variant = 'sidebar',
}: TLogoutButtonProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState<boolean>(false);

	async function handleLogout() {
		if (isLoading) return;

		setIsLoading(true);
		const supabase = createClient();
		const { error } = await supabase.auth.signOut();

		if (error) {
			setIsLoading(false);
			return;
		}

		router.replace('/' + locale);
		router.refresh();
	}

	return (
		<button
			type='button'
			disabled={isLoading}
			aria-label={label}
			onClick={handleLogout}
			className={
				variant === 'card'
					? 'flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border border-red-100 bg-red-50/45 px-4 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60 sm:px-5'
					: 'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-white/68 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-wait'
			}
		>
			<LogOut size={17} strokeWidth={1.7} />
			<span>{label}</span>
		</button>
	);
}
