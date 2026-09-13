import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { profileContentStyles as styles } from './profile-content.styles';

type TEmptyProfileStateProps = {
	description: string;
	icon: 'calendar' | 'gift' | 'heart' | 'shopping-bag';
	isRtl: boolean;
	title: string;
};

export default function EmptyProfileState({
	description,
	icon,
	isRtl,
	title,
}: TEmptyProfileStateProps) {
	return (
		<View style={styles.emptyState}>
			<View style={styles.emptyIcon}>
				<Feather name={icon} size={24} color={Colors.accent} />
			</View>
			<Text style={[styles.emptyTitle, isRtl && styles.rtlText]}>
				{title}
			</Text>
			<Text style={[styles.emptyText, isRtl && styles.rtlText]}>
				{description}
			</Text>
		</View>
	);
}
