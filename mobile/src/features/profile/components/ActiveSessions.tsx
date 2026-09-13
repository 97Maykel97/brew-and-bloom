import {
	ActivityIndicator,
	Alert,
	Pressable,
	Text,
	View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import type { TLocale } from '@/i18n/languages';
import { useActiveSessions } from '../hooks/use-active-sessions';
import type { TProfileTranslations } from '../profileTranslations';
import ActiveSessionItem from './ActiveSessionItem';
import { activeSessionsStyles as styles } from './active-sessions.styles';

type TActiveSessionsProps = {
	copy: TProfileTranslations;
	isRtl: boolean;
	locale: TLocale;
	onSignOutAll: () => Promise<void>;
};

export default function ActiveSessions({
	copy,
	isRtl,
	locale,
	onSignOutAll,
}: TActiveSessionsProps) {
	const {
		error,
		isLoading,
		isSigningOut,
		sessions,
		signOutOtherDevices,
		success,
	} = useActiveSessions({
		loadErrorMessage: copy.sessionsError,
		onSignOutAll,
		signOutErrorMessage: copy.signOutAllDevicesError,
		signOutSuccessMessage: copy.otherDevicesSignedOut,
	});
	const hasOtherDevices =
		sessions.length > 1 && sessions.some(session => !session.is_current);
	const isSignOutDisabled = isLoading || isSigningOut || !hasOtherDevices;

	function confirmSignOutAll() {
		if (isSignOutDisabled) return;

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
						void signOutOtherDevices();
					},
				},
			],
		);
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

				{sessions.map((session, index) => (
					<ActiveSessionItem
						key={session.session_id}
						copy={copy}
						hasDivider={index < sessions.length - 1}
						isRtl={isRtl}
						locale={locale}
						session={session}
					/>
				))}
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
