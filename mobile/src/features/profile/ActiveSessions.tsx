import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Feather } from '@expo/vector-icons';
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/languages';
import { registerCurrentMobileDevice } from '@/lib/auth/registerCurrentDevice';
import { supabase } from '@/lib/supabase';
import type { TProfileTranslations } from './profileTranslations';
import {
	formatSessionDate,
	getSessionDeviceInfo,
	type TSessionDeviceKind,
} from './sessionFormatters';

type TActiveSessionsProps = {
	copy: TProfileTranslations;
	isRtl: boolean;
	locale: TLocale;
	onSignOutAll: () => Promise<void>;
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

type TFeatherName = ComponentProps<typeof Feather>['name'];

const DEVICE_ICONS = {
	desktop: 'monitor',
	mobile: 'smartphone',
	tablet: 'tablet',
	unknown: 'airplay',
} satisfies Record<TSessionDeviceKind, TFeatherName>;

const SESSIONS_REFRESH_INTERVAL_MS = 60000;

export default function ActiveSessions({
	copy,
	isRtl,
	locale,
	onSignOutAll,
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
			await registerCurrentMobileDevice();

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
		const refreshIntervalId = setInterval(
			() => void loadSessions(),
			SESSIONS_REFRESH_INTERVAL_MS,
		);

		return () => {
			isActive = false;
			clearInterval(refreshIntervalId);
		};
	}, [copy.sessionsError]);

	function confirmSignOutAll() {
		if (isLoading || isSigningOut) return;

		Alert.alert(
			copy.signOutAllDevices,
			copy.signOutAllDevicesConfirm,
			[
				{
					text: copy.cancel,
					style: 'cancel',
				},
				{
					text: copy.signOutAllDevices,
					style: 'destructive',
					onPress: () => {
						void handleSignOutAll();
					},
				},
			],
		);
	}

	async function handleSignOutAll() {
		setError('');
		setSuccess('');
		setIsSigningOut(true);

		try {
			await onSignOutAll();
			setSessions(currentSessions =>
				currentSessions.filter(session => session.is_current),
			);
			setSuccess(copy.otherDevicesSignedOut);
			setIsSigningOut(false);
		} catch {
			setError(copy.signOutAllDevicesError);
			setIsSigningOut(false);
		}
	}

	return (
		<View style={styles.card}>
			<View style={[styles.header, isRtl && styles.rowRtl]}>
				<View style={styles.headerIcon}>
					<Feather name='shield' size={20} color={Colors.accent} />
				</View>
				<View style={styles.headerCopy}>
					<View style={[styles.titleRow, isRtl && styles.rowRtl]}>
						<Text style={[styles.title, isRtl && styles.rtlText]}>
							{copy.activeDevices}
						</Text>
						{!isLoading && !error ? (
							<View style={styles.countBadge}>
								<Text style={styles.countText}>{sessions.length}</Text>
							</View>
						) : null}
					</View>
					<Text style={[styles.description, isRtl && styles.rtlText]}>
						{copy.activeDevicesDescription}
					</Text>
				</View>
			</View>

			<View style={styles.sessionList}>
				{isLoading ? (
					<View style={styles.loading}>
						<ActivityIndicator size='small' color={Colors.accent} />
						<Text style={[styles.mutedText, isRtl && styles.rtlText]}>
							{copy.sessionsLoading}
						</Text>
					</View>
				) : null}

				{!isLoading && !error && sessions.length === 0 ? (
					<Text style={[styles.emptyText, isRtl && styles.rtlText]}>
						{copy.noActiveDevices}
					</Text>
				) : null}

				{sessions.map((session, index) => {
					const device = getSessionDeviceInfo(session.user_agent, {
						desktop: copy.desktopDevice,
						mobile: copy.mobileDevice,
						tablet: copy.tabletDevice,
						unknown: copy.unknownDevice,
						mobileApp: copy.mobileApp,
					});
					const deviceKind =
						session.client_kind === 'mobile_app'
							? 'mobile'
							: device.kind;
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
						<View
							key={session.session_id}
							style={[
								styles.session,
								isRtl && styles.rowRtl,
								index < sessions.length - 1 && styles.sessionDivider,
							]}
						>
							<View style={styles.deviceIcon}>
								<Feather
									name={DEVICE_ICONS[deviceKind]}
									size={18}
									color={Colors.accent}
								/>
							</View>
							<View style={styles.sessionCopy}>
								<View
									style={[
										styles.deviceTitleRow,
										isRtl && styles.rowRtl,
									]}
								>
									<Text
										numberOfLines={1}
										style={[
											styles.deviceName,
											isRtl && styles.rtlText,
										]}
									>
										{deviceName}
									</Text>
									{session.is_current ? (
										<View style={styles.currentBadge}>
											<Text style={styles.currentBadgeText}>
												{copy.currentDevice}
											</Text>
										</View>
									) : null}
								</View>
								{deviceDetails ? (
									<Text
										numberOfLines={1}
										style={[
											styles.deviceDetails,
											isRtl && styles.rtlText,
										]}
									>
										{deviceDetails}
									</Text>
								) : null}
								<Text
									style={[
										styles.lastActive,
										isRtl && styles.rtlText,
									]}
								>
									{copy.lastActive}:{' '}
									{formatSessionDate(session.last_active_at, locale)}
								</Text>
							</View>
						</View>
					);
				})}
			</View>

			{error ? (
				<Text style={[styles.error, isRtl && styles.rtlText]}>
					{error}
				</Text>
			) : null}
			{success ? (
				<Text style={[styles.success, isRtl && styles.rtlText]}>
					{success}
				</Text>
			) : null}

			<Pressable
				accessibilityRole='button'
				disabled={isSignOutDisabled}
				onPress={confirmSignOutAll}
				style={({ pressed }) => [
					styles.signOutAllButton,
					isRtl && styles.rowRtl,
					pressed && styles.pressed,
					isSignOutDisabled && styles.disabled,
				]}
			>
				<Feather name='log-out' size={17} color='#C95C52' />
				<Text style={styles.signOutAllText}>
					{isSigningOut
						? copy.signingOutAllDevices
						: copy.signOutAllDevices}
				</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		marginVertical: Spacing.small,
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#E5DCD3',
		borderRadius: 16,
		backgroundColor: '#FCFAF7',
	},
	header: {
		padding: 14,
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#E5DCD3',
	},
	headerIcon: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
		backgroundColor: '#EFE4D8',
	},
	headerCopy: {
		flex: 1,
		gap: 4,
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 7,
	},
	title: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 15,
		fontWeight: '700',
	},
	countBadge: {
		minWidth: 24,
		height: 22,
		paddingHorizontal: 7,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 11,
		backgroundColor: '#EFE4D8',
	},
	countText: {
		color: Colors.accent,
		fontFamily: Fonts.sans,
		fontSize: 11,
		fontWeight: '700',
	},
	description: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
		lineHeight: 17,
	},
	sessionList: {
		paddingHorizontal: 14,
	},
	loading: {
		minHeight: 62,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	mutedText: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
	},
	emptyText: {
		paddingVertical: 18,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
	},
	session: {
		minHeight: 76,
		paddingVertical: 12,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
	},
	sessionDivider: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#E5DCD3',
	},
	deviceIcon: {
		width: 38,
		height: 38,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: '#E5DCD3',
		borderRadius: 12,
		backgroundColor: Colors.white,
	},
	sessionCopy: {
		flex: 1,
		minWidth: 0,
		gap: 2,
	},
	deviceTitleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	deviceName: {
		flexShrink: 1,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 13,
		fontWeight: '700',
	},
	currentBadge: {
		paddingHorizontal: 7,
		paddingVertical: 3,
		borderRadius: 999,
		backgroundColor: '#E7F5EC',
	},
	currentBadgeText: {
		color: '#287A48',
		fontFamily: Fonts.sans,
		fontSize: 9,
		fontWeight: '700',
	},
	deviceDetails: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 11,
	},
	lastActive: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 10,
	},
	error: {
		paddingHorizontal: 14,
		paddingTop: 12,
		color: '#C95C52',
		fontFamily: Fonts.sans,
		fontSize: 12,
	},
	success: {
		paddingHorizontal: 14,
		paddingTop: 12,
		color: '#287A48',
		fontFamily: Fonts.sans,
		fontSize: 12,
	},
	signOutAllButton: {
		minHeight: 46,
		margin: 14,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
		borderWidth: 1,
		borderColor: '#F0C9C4',
		borderRadius: 12,
		backgroundColor: '#FFF5F3',
	},
	signOutAllText: {
		color: '#C95C52',
		fontFamily: Fonts.sans,
		fontSize: 13,
		fontWeight: '700',
		textAlign: 'center',
	},
	rowRtl: {
		flexDirection: 'row-reverse',
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
	pressed: {
		opacity: 0.65,
	},
	disabled: {
		opacity: 0.55,
	},
});
