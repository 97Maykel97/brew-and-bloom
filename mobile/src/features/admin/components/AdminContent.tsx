import { Feather } from '@expo/vector-icons';
import {
	Pressable,
	ScrollView,
	Text,
	View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import type { TAdminSection, TAdminTranslation } from '../types';
import { adminNavigationItems } from './admin-navigation';
import { adminContentStyles as styles } from './admin-content.styles';
import AdminNavigation from './AdminNavigation';
import AdminMenu from './AdminMenu';
import AdminBookings from './AdminBookings';
import AdminOrders from './AdminOrders';
import AdminOverview from './AdminOverview';
import type { TLocale } from '@/i18n/translations';

type TAdminContentProps = {
	activeSection: TAdminSection;
	copy: TAdminTranslation;
	displayName: string;
	isRtl: boolean;
	locale: TLocale;
	onLogout: () => void;
	onSectionChange: (section: TAdminSection) => void;
};

export default function AdminContent({
	activeSection,
	copy,
	displayName,
	isRtl,
	locale,
	onLogout,
	onSectionChange,
}: TAdminContentProps) {
	const activeItem = adminNavigationItems.find(
		item => item.section === activeSection,
	);

	return (
		<ScrollView
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			<View style={styles.heading}>
				<Text style={[styles.eyebrow, isRtl && styles.rtlText]}>
					{copy.administrator}
				</Text>
				<Text style={[styles.title, isRtl && styles.rtlText]}>
					{copy.title}
				</Text>
				<Text style={[styles.subtitle, isRtl && styles.rtlText]}>
					{copy.subtitle}
				</Text>
				<View
					style={[
						styles.userBadge,
						isRtl && styles.rtlRow,
						isRtl && styles.rtlBadge,
					]}
				>
					<Feather name='shield' size={15} color={Colors.accent} />
					<Text style={[styles.userName, isRtl && styles.rtlText]}>
						{displayName}
					</Text>
				</View>
			</View>

			<AdminNavigation
				activeSection={activeSection}
				copy={copy}
				isRtl={isRtl}
				onSectionChange={onSectionChange}
			/>

			{activeSection === 'overview' ? (
				<AdminOverview copy={copy} isRtl={isRtl} locale={locale} onSectionChange={onSectionChange} />
			) : activeSection === 'orders' ? (
				<AdminOrders isRtl={isRtl} locale={locale} />
			) : activeSection === 'bookings' ? (
				<AdminBookings isRtl={isRtl} locale={locale} />
			) : activeSection === 'menu' ? (
				<AdminMenu isRtl={isRtl} locale={locale} />
			) : (
				<View style={styles.placeholder}>
					{activeItem ? (
						<View style={styles.placeholderIcon}>
							<Feather
								name={activeItem.icon}
								size={24}
								color={Colors.accent}
							/>
						</View>
					) : null}
					<Text style={[styles.placeholderTitle, isRtl && styles.rtlText]}>
						{copy.navigation[activeSection]}
					</Text>
					<Text style={[styles.placeholderText, isRtl && styles.rtlText]}>
						{copy.sectionDescriptions[activeSection]}
					</Text>
				</View>
			)}

			<Pressable
				accessibilityRole='button'
				onPress={onLogout}
				style={({ pressed }) => [
					styles.logout,
					isRtl && styles.rtlRow,
					pressed && styles.pressed,
				]}
			>
				<Feather name='log-out' size={18} color='#C65353' />
				<Text style={styles.logoutText}>{copy.logout}</Text>
			</Pressable>
		</ScrollView>
	);
}
