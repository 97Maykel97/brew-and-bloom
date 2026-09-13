import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { TLocale } from '@/i18n/languages';
import ActiveSessions from './ActiveSessions';
import ChangePasswordForm from './ChangePasswordForm';
import DeleteAccountButton from './DeleteAccountButton';
import type { TProfileTranslations } from '../profileTranslations';
import { profileContentStyles as styles } from './profile-content.styles';

type TProfileSettingsProps = {
	copy: TProfileTranslations;
	isRtl: boolean;
	locale: TLocale;
	onLogout: () => void;
	onLogoutAll: () => Promise<void>;
};

export default function ProfileSettings({
	copy,
	isRtl,
	locale,
	onLogout,
	onLogoutAll,
}: TProfileSettingsProps) {
	const chevron = isRtl ? 'chevron-left' : 'chevron-right';

	return (
		<View style={styles.settingsCard}>
			<Text style={[styles.settingsTitle, isRtl && styles.rtlText]}>
				{copy.settings}
			</Text>
			<Text style={[styles.settingsText, isRtl && styles.rtlText]}>
				{copy.settingsDescription}
			</Text>

			<ChangePasswordForm copy={copy} isRtl={isRtl} locale={locale} />
			<ActiveSessions
				copy={copy}
				isRtl={isRtl}
				locale={locale}
				onSignOutAll={onLogoutAll}
			/>

			<Pressable
				accessibilityRole='button'
				onPress={onLogout}
				style={({ pressed }) => [
					styles.actionRow,
					styles.logoutRow,
					isRtl && styles.rowRtl,
					pressed && styles.pressed,
				]}
			>
				<Feather name='log-out' size={18} color='#C95C52' />
				<Text style={[styles.logoutText, isRtl && styles.rtlText]}>
					{copy.signOut}
				</Text>
				<Feather name={chevron} size={18} color='#C95C52' />
			</Pressable>

			<DeleteAccountButton copy={copy} locale={locale} />
		</View>
	);
}
