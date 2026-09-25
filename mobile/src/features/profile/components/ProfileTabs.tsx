import { Pressable, Text, View } from 'react-native';

import type { TProfileTranslations } from '../profileTranslations';
import type { TProfileTab } from '../types';
import { profileContentStyles as styles } from './profile-content.styles';

type TProfileTabsProps = {
	activeTab: TProfileTab;
	copy: TProfileTranslations;
	isRtl: boolean;
	onTabChange: (tab: TProfileTab) => void;
};

export default function ProfileTabs({
	activeTab,
	copy,
	isRtl,
	onTabChange,
}: TProfileTabsProps) {
	const tabs: { key: TProfileTab; label: string }[] = [
		{ key: 'profile', label: copy.profileTab },
		{ key: 'orders', label: copy.orders },
		{ key: 'bookings', label: copy.bookings },
		{ key: 'events', label: copy.events },
		{ key: 'favorites', label: copy.favorites },
		{ key: 'bonuses', label: copy.bonusTab },
		{ key: 'settings', label: copy.settings },
	];

	return (
		<View style={[styles.tabs, isRtl && styles.tabsRtl]}>
			{tabs.map(tab => (
				<Pressable
					key={tab.key}
					accessibilityRole='tab'
					accessibilityState={{ selected: activeTab === tab.key }}
					onPress={() => onTabChange(tab.key)}
					style={({ pressed }) => [
						styles.tab,
						activeTab === tab.key && styles.activeTab,
						pressed && styles.pressed,
					]}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === tab.key && styles.activeTabText,
							isRtl && styles.rtlText,
						]}
					>
						{tab.label}
					</Text>
				</Pressable>
			))}
		</View>
	);
}
