import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { TAdminSection, TAdminTranslation } from '../types';
import { adminNavigationItems } from './admin-navigation';
import { adminNavigationStyles as styles } from './admin-navigation.styles';

type TAdminNavigationProps = {
	activeSection: TAdminSection;
	copy: TAdminTranslation;
	isRtl: boolean;
	onSectionChange: (section: TAdminSection) => void;
};

export default function AdminNavigation({
	activeSection,
	copy,
	isRtl,
	onSectionChange,
}: TAdminNavigationProps) {
	return (
		<View style={[styles.navigation, isRtl && styles.rtlRow]}>
			{adminNavigationItems.map(item => {
				const isActive = activeSection === item.section;

				return (
					<Pressable
						key={item.section}
						accessibilityRole='tab'
						accessibilityState={{ selected: isActive }}
						onPress={() => onSectionChange(item.section)}
						style={({ pressed }) => [
							styles.item,
							isActive && styles.activeItem,
							pressed && styles.pressed,
						]}
					>
						<Feather
							name={item.icon}
							size={16}
							color={isActive ? Colors.white : Colors.muted}
						/>
						<Text
							numberOfLines={1}
							style={[
								styles.label,
								isActive && styles.activeLabel,
								isRtl && styles.rtlText,
							]}
						>
							{copy.navigation[item.section]}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
}
