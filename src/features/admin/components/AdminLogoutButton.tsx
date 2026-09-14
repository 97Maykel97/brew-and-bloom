'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import type { TAdminLocale } from '../types';

type TAdminLogoutButtonProps = {
	locale: TAdminLocale;
	label: string;
};

export default function AdminLogoutButton({
	locale,
	label,
}: TAdminLogoutButtonProps) {
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);

	async function handleSignOut() {
		if (isSigningOut) return;

		setIsSigningOut(true);
		const supabase = createClient();
		await supabase.auth.signOut();
		router.replace('/' + locale + '/auth/login');
		router.refresh();
	}

	return (
		<button
			type='button'
			onClick={handleSignOut}
			disabled={isSigningOut}
			className='flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60'
		>
			<LogOut size={17} strokeWidth={1.7} />
			<span>{label}</span>
		</button>
	);
}
