import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { TLocale } from '@/i18n/languages';
import { getInitials } from '../lib/profile-formatters';
import type { TProfileTranslations } from '../profileTranslations';
import type { TMobileProfileData } from '../types';
import ProfileEditForm from './ProfileEditForm';
import { profileContentStyles as styles } from './profile-content.styles';

type TProfileDetailsProps = {
	copy: TProfileTranslations;
	isEditing: boolean;
	isRtl: boolean;
	locale: TLocale;
	onCancelEdit: () => void;
	onProfileSaved: (profile: TMobileProfileData) => void;
	profile: TMobileProfileData;
};

export default function ProfileDetails({
	copy,
	isEditing,
	isRtl,
	locale,
	onCancelEdit,
	onProfileSaved,
	profile,
}: TProfileDetailsProps) {
	if (isEditing) {
		return (
			<ProfileEditForm
				copy={copy}
				locale={locale}
				profile={profile}
				onCancel={onCancelEdit}
				onSaved={onProfileSaved}
			/>
		);
	}

	const initials = getInitials(profile.firstName, profile.lastName);
	const rows = [
		{ icon: 'user' as const, label: copy.name, value: profile.displayName },
		{ icon: 'mail' as const, label: copy.email, value: profile.email },
		{ icon: 'phone' as const, label: copy.phone, value: profile.phone },
		{
			icon: 'calendar' as const,
			label: copy.birthDate,
			value: profile.birthDate,
		},
	];

	return (
		<View style={styles.detailsCard}>
			<View style={[styles.profileIdentity, isRtl && styles.identityRtl]}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>{initials || '—'}</Text>
				</View>
				<View style={styles.identityCopy}>
					<Text style={[styles.identityName, isRtl && styles.rtlText]}>
						{profile.displayName}
					</Text>
					<Text style={[styles.identityEmail, isRtl && styles.rtlText]}>
						{profile.email}
					</Text>
					<Text
						style={[
							styles.identityPhone,
							isRtl && styles.rtlText,
							styles.ltrText,
						]}
					>
						{profile.phone}
					</Text>
				</View>
			</View>

			<View style={styles.rows}>
				{rows.map(row => (
					<View
						key={row.label}
						style={[styles.row, isRtl && styles.rowRtl]}
					>
						<Feather name={row.icon} size={17} color={Colors.accent} />
						<Text style={[styles.rowLabel, isRtl && styles.rtlText]}>
							{row.label}
						</Text>
						<Text
							numberOfLines={1}
							style={[
								styles.rowValue,
								isRtl && styles.rtlText,
								row.icon === 'phone' && styles.ltrText,
							]}
						>
							{row.value}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}
