import { useEffect } from 'react';
import { AppState } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { getLocale } from '@/i18n/locale';
import { registerCurrentMobileDevice } from '@/lib/auth/registerCurrentDevice';
import { supabase } from '@/lib/supabase';

const SESSION_CHECK_INTERVAL_MS = 3000;
const DEVICE_ACTIVITY_INTERVAL_MS = 60000;

export default function SessionGuard() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);

	useEffect(() => {
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
					router.replace({
						pathname: '/auth/login',
						params: { locale },
					});
					return;
				}

				if (
					Date.now() - lastActivityUpdateAt >=
					DEVICE_ACTIVITY_INTERVAL_MS
				) {
					await registerCurrentMobileDevice();
					lastActivityUpdateAt = Date.now();
				}
			} finally {
				isChecking = false;
			}
		}

		const intervalId = setInterval(
			() => void verifySession(),
			SESSION_CHECK_INTERVAL_MS,
		);
		const appStateSubscription = AppState.addEventListener(
			'change',
			nextState => {
				if (nextState === 'active') {
					void verifySession();
				}
			},
		);

		void verifySession();

		return () => {
			isDisposed = true;
			clearInterval(intervalId);
			appStateSubscription.remove();
		};
	}, [locale]);

	return null;
}
