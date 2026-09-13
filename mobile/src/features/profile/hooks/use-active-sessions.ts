import { useEffect, useState } from 'react';

import { registerCurrentMobileDevice } from '@/lib/auth/registerCurrentDevice';
import { supabase } from '@/lib/supabase';

export type TSessionRecord = {
	session_id: string;
	user_agent: string | null;
	device_name: string | null;
	device_platform: string | null;
	client_kind: string | null;
	created_at: string;
	last_active_at: string;
	is_current: boolean;
};

type TUseActiveSessionsOptions = {
	loadErrorMessage: string;
	onSignOutAll: () => Promise<void>;
	signOutErrorMessage: string;
	signOutSuccessMessage: string;
};

const SESSIONS_REFRESH_INTERVAL_MS = 60000;

export function useActiveSessions({
	loadErrorMessage,
	onSignOutAll,
	signOutErrorMessage,
	signOutSuccessMessage,
}: TUseActiveSessionsOptions) {
	const [sessions, setSessions] = useState<TSessionRecord[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [success, setSuccess] = useState<string>('');

	useEffect(() => {
		let isActive = true;

		async function loadSessions() {
			await registerCurrentMobileDevice();

			const { data, error: sessionsError } = await supabase.rpc(
				'get_current_session_devices',
			);

			if (!isActive) return;

			if (sessionsError) {
				setError(loadErrorMessage);
				setIsLoading(false);
				return;
			}

			setSessions((data ?? []) as TSessionRecord[]);
			setIsLoading(false);
		}

		void loadSessions();
		const refreshIntervalId = setInterval(
			() => void loadSessions(),
			SESSIONS_REFRESH_INTERVAL_MS,
		);

		return () => {
			isActive = false;
			clearInterval(refreshIntervalId);
		};
	}, [loadErrorMessage]);

	async function signOutOtherDevices() {
		setError('');
		setSuccess('');
		setIsSigningOut(true);

		try {
			await onSignOutAll();
			setSessions(currentSessions =>
				currentSessions.filter(session => session.is_current),
			);
			setSuccess(signOutSuccessMessage);
		} catch {
			setError(signOutErrorMessage);
		} finally {
			setIsSigningOut(false);
		}
	}

	return {
		error,
		isLoading,
		isSigningOut,
		sessions,
		signOutOtherDevices,
		success,
	};
}
