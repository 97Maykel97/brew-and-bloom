import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { TAdminTranslation } from '../types';
import { adminOverviewStyles as styles } from './admin-overview.styles';

type TAdminOverviewProps = {
	copy: TAdminTranslation;
	isRtl: boolean;
};

export default function AdminOverview({
	copy,
	isRtl,
}: TAdminOverviewProps) {
	const statistics = [
		{ label: copy.overview.orders, icon: 'shopping-bag' as const },
		{ label: copy.overview.bookings, icon: 'calendar' as const },
		{ label: copy.overview.users, icon: 'users' as const },
		{ label: copy.overview.menuItems, icon: 'coffee' as const },
	];

	return (
		<View style={styles.wrapper}>
			<View style={[styles.statistics, isRtl && styles.rtlRow]}>
				{statistics.map(item => (
					<View key={item.label} style={styles.statCard}>
						<View style={styles.iconCircle}>
							<Feather
								name={item.icon}
								size={18}
								color={Colors.accent}
							/>
						</View>
						<Text style={[styles.value, isRtl && styles.rtlText]}>—</Text>
						<Text style={[styles.statLabel, isRtl && styles.rtlText]}>
							{item.label}
						</Text>
					</View>
				))}
			</View>

			<View style={styles.activityCard}>
				<Text style={[styles.activityTitle, isRtl && styles.rtlText]}>
					{copy.overview.recentActivity}
				</Text>
				<View style={styles.emptyActivity}>
					<View style={styles.emptyIcon}>
						<Feather name='inbox' size={22} color={Colors.accent} />
					</View>
					<Text style={[styles.emptyText, isRtl && styles.rtlText]}>
						{copy.overview.emptyActivity}
					</Text>
				</View>
			</View>
		</View>
	);
}
