'use client';

import { useEffect, useState } from 'react';
import {
	Laptop,
	LogOut,
	MonitorSmartphone,
	ShieldCheck,
	Smartphone,
	Tablet,
} from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { registerCurrentWebDevice } from '@/lib/auth/register-current-device';
import {
	formatSessionDate,
	getSessionDeviceInfo,
	type TSessionDeviceKind,
} from '../lib/session-formatters';
import type { TProfileCopy } from '../profile-copy';
import type { TProfileLocale } from '../types';

type TActiveSessionsProps = {
	copy: TProfileCopy;
	locale: TProfileLocale;
};

type TSessionRecord = {
	session_id: string;
	user_agent: string | null;
	device_name: string | null;
	device_platform: string | null;
	client_kind: string | null;
	created_at: string;
	last_active_at: string;
	is_current: boolean;
};

const DEVICE_ICONS = {
	desktop: Laptop,
	mobile: Smartphone,
	tablet: Tablet,
	unknown: MonitorSmartphone,
} satisfies Record<TSessionDeviceKind, typeof Laptop>;

const SESSIONS_REFRESH_INTERVAL_MS = 60000;

export default function ActiveSessions({
	copy,
	locale,
}: TActiveSessionsProps) {
	const [sessions, setSessions] = useState<TSessionRecord[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
	const [error, setError] = useState<string>('');
	const [success, setSuccess] = useState<string>('');
	const hasOtherDevices =
		sessions.length > 1 && sessions.some(session => !session.is_current);
	const isSignOutDisabled = isLoading || isSigningOut || !hasOtherDevices;

	useEffect(() => {
		let isActive = true;

		async function loadSessions() {
			await registerCurrentWebDevice();

			const supabase = createClient();
			const { data, error: sessionsError } = await supabase.rpc(
				'get_current_session_devices',
			);

			if (!isActive) return;

			if (sessionsError) {
				setError(copy.sessionsError);
				setIsLoading(false);
				return;
			}

			setSessions((data ?? []) as TSessionRecord[]);
			setIsLoading(false);
		}

		void loadSessions();
		const refreshIntervalId = window.setInterval(
			() => void loadSessions(),
			SESSIONS_REFRESH_INTERVAL_MS,
		);

		return () => {
			isActive = false;
			window.clearInterval(refreshIntervalId);
		};
	}, [copy.sessionsError]);

	async function handleSignOutAll() {
		if (
			isSigningOut ||
			!window.confirm(copy.signOutAllDevicesConfirm)
		) {
			return;
		}

		setError('');
		setSuccess('');
		setIsSigningOut(true);

		const supabase = createClient();
		const { error: signOutError } = await supabase.auth.signOut({
			scope: 'others',
		});

		if (signOutError) {
			setError(copy.signOutAllDevicesError);
			setIsSigningOut(false);
			return;
		}

		setSessions(currentSessions =>
			currentSessions.filter(session => session.is_current),
		);
		setSuccess(copy.otherDevicesSignedOut);
		setIsSigningOut(false);
	}

	return (
		<div className='overflow-hidden rounded-2xl border border-[#e5dcd3] bg-[#fcfaf7]'>
			<div className='flex items-start gap-3 border-b border-[#eee5dc] px-4 py-4 sm:px-5'>
				<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#efe4d8] text-[var(--accent)]'>
					<ShieldCheck size={20} strokeWidth={1.7} />
				</div>
				<div className='min-w-0 flex-1'>
					<div className='flex flex-wrap items-center gap-2'>
						<h3 className='font-semibold'>{copy.activeDevices}</h3>
						{!isLoading && !error ? (
							<span className='rounded-full bg-[#efe4d8] px-2 py-0.5 text-xs font-medium text-[var(--accent)]'>
								{sessions.length}
							</span>
						) : null}
					</div>
					<p className='mt-1 text-sm leading-5 text-[var(--muted)]'>
						{copy.activeDevicesDescription}
					</p>
				</div>
			</div>

			<div className='divide-y divide-[#eee5dc] px-4 sm:px-5'>
				{isLoading ? (
					<p className='py-5 text-sm text-[var(--muted)]'>
						{copy.sessionsLoading}
					</p>
				) : null}

				{!isLoading && !error && sessions.length === 0 ? (
					<p className='py-5 text-sm text-[var(--muted)]'>
						{copy.noActiveDevices}
					</p>
				) : null}

				{sessions.map(session => {
					const device = getSessionDeviceInfo(session.user_agent, {
						desktop: copy.desktopDevice,
						mobile: copy.mobileDevice,
						tablet: copy.tabletDevice,
						unknown: copy.unknownDevice,
						mobileApp: copy.mobileApp,
					});
					const DeviceIcon = DEVICE_ICONS[device.kind];
					const deviceName = session.device_name || device.name;
					const deviceDetails = [
						session.client_kind === 'mobile_app'
							? copy.mobileApp
							: '',
						session.device_platform || device.details,
					]
						.filter(Boolean)
						.join(' · ');

					return (
						<div
							key={session.session_id}
							className='flex items-center gap-3 py-4'
						>
							<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--accent)] shadow-[inset_0_0_0_1px_#eee5dc]'>
								<DeviceIcon size={19} strokeWidth={1.7} />
							</div>
							<div className='min-w-0 flex-1'>
								<div className='flex flex-wrap items-center gap-2'>
									<p className='truncate text-sm font-semibold'>
										{deviceName}
									</p>
									{session.is_current ? (
										<span className='rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700'>
											{copy.currentDevice}
										</span>
									) : null}
								</div>
								{deviceDetails ? (
									<p className='mt-0.5 truncate text-xs text-[var(--muted)]'>
										{deviceDetails}
									</p>
								) : null}
								<p className='mt-1 text-xs text-[var(--muted)]'>
									{copy.lastActive}:{' '}
									{formatSessionDate(session.last_active_at, locale)}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			{error ? (
				<p role='alert' className='px-4 pt-4 text-sm text-red-500 sm:px-5'>
					{error}
				</p>
			) : null}
			{success ? (
				<p
					role='status'
					className='px-4 pt-4 text-sm text-emerald-700 sm:px-5'
				>
					{success}
				</p>
			) : null}

			<div className='p-4 sm:p-5'>
				<button
					type='button'
					disabled={isSignOutDisabled}
					onClick={handleSignOutAll}
					className='flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-4 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40'
				>
					<LogOut size={17} strokeWidth={1.8} />
					{isSigningOut
						? copy.signingOutAllDevices
						: copy.signOutAllDevices}
				</button>
			</div>
		</div>
	);
}
