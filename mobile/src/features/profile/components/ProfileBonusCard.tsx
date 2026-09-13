import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { TProfileTranslations } from '../profileTranslations';
import { profileContentStyles as styles } from './profile-content.styles';

type TProfileBonusCardProps = {
	bonusPoints: number;
	copy: TProfileTranslations;
	isRtl: boolean;
	onPress: () => void;
};

export default function ProfileBonusCard({
	bonusPoints,
	copy,
	isRtl,
	onPress,
}: TProfileBonusCardProps) {
	return (
		<Pressable
			accessibilityRole='button'
			onPress={onPress}
			style={({ pressed }) => [
				styles.bonusCard,
				pressed && styles.pressed,
			]}
		>
			<View style={styles.bonusIcon}>
				<Feather name='gift' size={21} color={Colors.accent} />
			</View>
			<View style={styles.bonusCopy}>
				<Text style={styles.bonusTitle}>{copy.bonusTitle}</Text>
				<Text style={styles.bonusText}>
					{copy.bonusText}{' '}
					<Text style={styles.bonusValue}>{bonusPoints}</Text>{' '}
					{copy.bonuses}
				</Text>
			</View>
			<Feather
				name={isRtl ? 'chevron-left' : 'chevron-right'}
				size={18}
				color={Colors.muted}
			/>
		</Pressable>
	);
}
