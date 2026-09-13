import type { ComponentProps } from 'react';
import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { TLocale } from '@/i18n/languages';
import {
	formatSessionDate,
	getSessionDeviceInfo,
	type TSessionDeviceKind,
} from '../lib/session-formatters';
import type { TProfileTranslations } from '../profileTranslations';
import type { TSessionRecord } from '../hooks/use-active-sessions';
import { activeSessionsStyles as styles } from './active-sessions.styles';

type TFeatherName = ComponentProps<typeof Feather>['name'];

const DEVICE_ICONS = {
	desktop: 'monitor',
	mobile: 'smartphone',
	tablet: 'tablet',
	unknown: 'airplay',
} satisfies Record<TSessionDeviceKind, TFeatherName>;

type TActiveSessionItemProps = {
	copy: TProfileTranslations;
	hasDivider: boolean;
	isRtl: boolean;
	locale: TLocale;
	session: TSessionRecord;
};

export default function ActiveSessionItem({
	copy,
	hasDivider,
	isRtl,
	locale,
	session,
}: TActiveSessionItemProps) {
	const device = getSessionDeviceInfo(session.user_agent, {
		desktop: copy.desktopDevice,
		mobile: copy.mobileDevice,
		tablet: copy.tabletDevice,
		unknown: copy.unknownDevice,
		mobileApp: copy.mobileApp,
	});
	const deviceKind =
		session.client_kind === 'mobile_app' ? 'mobile' : device.kind;
	const deviceName = session.device_name || device.name;
	const deviceDetails = [
		session.client_kind === 'mobile_app' ? copy.mobileApp : '',
		session.device_platform || device.details,
	]
		.filter(Boolean)
		.join(' · ');

	return (
		<View
			style={[
				styles.session,
				isRtl && styles.rowRtl,
				hasDivider && styles.sessionDivider,
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
				<View style={[styles.deviceTitleRow, isRtl && styles.rowRtl]}>
					<Text
						numberOfLines={1}
						style={[styles.deviceName, isRtl && styles.rtlText]}
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
						style={[styles.deviceDetails, isRtl && styles.rtlText]}
					>
						{deviceDetails}
					</Text>
				) : null}
				<Text style={[styles.lastActive, isRtl && styles.rtlText]}>
					{copy.lastActive}:{' '}
					{formatSessionDate(session.last_active_at, locale)}
				</Text>
			</View>
		</View>
	);
}
