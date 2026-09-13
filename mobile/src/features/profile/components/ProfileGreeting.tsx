import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { TMobileProfileData } from '../types';
import type { TProfileTranslations } from '../profileTranslations';
import { profileContentStyles as styles } from './profile-content.styles';

type TProfileGreetingProps = {
	copy: TProfileTranslations;
	isRtl: boolean;
	onEdit: () => void;
	profile: TMobileProfileData;
	showEdit: boolean;
};

export default function ProfileGreeting({
	copy,
	isRtl,
	onEdit,
	profile,
	showEdit,
}: TProfileGreetingProps) {
	return (
		<View style={styles.greeting}>
			<Text style={[styles.eyebrow, isRtl && styles.rtlText]}>
				{copy.title}
			</Text>
			<Text style={[styles.title, isRtl && styles.rtlText]}>
				{copy.welcome},{'\n'}
				{profile.displayName}
			</Text>
			<Text style={[styles.greetingText, isRtl && styles.rtlText]}>
				{copy.greeting}
			</Text>
			{showEdit ? (
				<Pressable
					accessibilityRole='button'
					onPress={onEdit}
					style={({ pressed }) => [
						styles.editButton,
						pressed && styles.pressed,
					]}
				>
					<Feather name='edit-3' size={15} color={Colors.white} />
					<Text style={styles.editButtonText}>{copy.edit}</Text>
				</Pressable>
			) : null}
		</View>
	);
}
