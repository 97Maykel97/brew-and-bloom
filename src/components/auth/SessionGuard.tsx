'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { registerCurrentWebDevice } from '@/lib/auth/register-current-device';
import { createClient } from '@/lib/supabase/client';

const SESSION_CHECK_INTERVAL_MS = 3000;
const DEVICE_ACTIVITY_INTERVAL_MS = 60000;

type TSessionGuardProps = {
	locale: string;
};

export default function SessionGuard({ locale }: TSessionGuardProps) {
	const router = useRouter();

	useEffect(() => {
		const supabase = createClient();
		let isChecking = false;
		let isDisposed = false;
		let lastActivityUpdateAt = 0;

		async function verifySession() {
			if (isChecking || isDisposed) return;

			isChecking = true;

			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (!session || isDisposed) return;

				const { data: isActive, error } = await supabase.rpc(
					'is_current_session_active',
				);

				if (!error && isActive === false && !isDisposed) {
					await supabase.auth.signOut({ scope: 'local' });
					router.replace('/' + locale + '/auth/login');
					router.refresh();
					return;
				}

				if (
					Date.now() - lastActivityUpdateAt >=
					DEVICE_ACTIVITY_INTERVAL_MS
				) {
					await registerCurrentWebDevice();
					lastActivityUpdateAt = Date.now();
				}
			} finally {
				isChecking = false;
			}
		}

		function handleVisibilityChange() {
			if (document.visibilityState === 'visible') {
				void verifySession();
			}
		}

		const intervalId = window.setInterval(
			() => void verifySession(),
			SESSION_CHECK_INTERVAL_MS,
		);

		window.addEventListener('focus', verifySession);
		document.addEventListener('visibilitychange', handleVisibilityChange);
		void verifySession();

		return () => {
			isDisposed = true;
			window.clearInterval(intervalId);
			window.removeEventListener('focus', verifySession);
			document.removeEventListener(
				'visibilitychange',
				handleVisibilityChange,
			);
		};
	}, [locale, router]);

	return null;
}
