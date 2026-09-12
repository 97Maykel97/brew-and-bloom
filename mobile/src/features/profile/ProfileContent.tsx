import { Feather } from '@expo/vector-icons';
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';
import type {
	TProfileOrderStatus,
	TProfileTab,
	TMobileProfileData,
} from './types';
import { getInitials } from './profileFormatters';
import {
	profileTranslations,
	type TProfileTranslations,
} from './profileTranslations';

type TProfileContentProps = {
	activeStatus: TProfileOrderStatus;
	activeTab: TProfileTab;
	locale: keyof typeof profileTranslations;
	onChangePassword: () => void;
	onLogout: () => void;
	onStatusChange: (status: TProfileOrderStatus) => void;
	onTabChange: (tab: TProfileTab) => void;
	profile: TMobileProfileData;
};

export default function ProfileContent({
	activeStatus,
	activeTab,
	locale,
	onChangePassword,
	onLogout,
	onStatusChange,
	onTabChange,
	profile,
}: TProfileContentProps) {
	const copy = profileTranslations[locale];
	const isRtl = locale === 'he';

	return (
		<ScrollView
			contentContainerStyle={styles.content}
			showsVerticalScrollIndicator={false}
		>
			<ProfileGreeting
				copy={copy}
				isRtl={isRtl}
				profile={profile}
			/>
			<BonusCard
				bonusPoints={profile.bonusPoints}
				copy={copy}
				isRtl={isRtl}
				onPress={() => onTabChange('bonuses')}
			/>
			<ProfileTabs
				activeTab={activeTab}
				copy={copy}
				isRtl={isRtl}
				onTabChange={onTabChange}
			/>

			<ProfileTabContent
				activeStatus={activeStatus}
				activeTab={activeTab}
				copy={copy}
				isRtl={isRtl}
				onChangePassword={onChangePassword}
				onLogout={onLogout}
				onStatusChange={onStatusChange}
				profile={profile}
			/>
		</ScrollView>
	);
}

type TProfileGreetingProps = {
	copy: TProfileTranslations;
	isRtl: boolean;
	profile: TMobileProfileData;
};

function ProfileGreeting({
	copy,
	isRtl,
	profile,
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
		</View>
	);
}

type TBonusCardProps = {
	bonusPoints: number;
	copy: TProfileTranslations;
	isRtl: boolean;
	onPress: () => void;
};

function BonusCard({
	bonusPoints,
	copy,
	isRtl,
	onPress,
}: TBonusCardProps) {
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

type TProfileTabsProps = {
	activeTab: TProfileTab;
	copy: TProfileTranslations;
	isRtl: boolean;
	onTabChange: (tab: TProfileTab) => void;
};

function ProfileTabs({
	activeTab,
	copy,
	isRtl,
	onTabChange,
}: TProfileTabsProps) {
	const tabs: { key: TProfileTab; label: string }[] = [
		{ key: 'profile', label: copy.profileTab },
		{ key: 'orders', label: copy.orders },
		{ key: 'bookings', label: copy.bookings },
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

type TProfileTabContentProps = {
	activeStatus: TProfileOrderStatus;
	activeTab: TProfileTab;
	copy: TProfileTranslations;
	isRtl: boolean;
	onChangePassword: () => void;
	onLogout: () => void;
	onStatusChange: (status: TProfileOrderStatus) => void;
	profile: TMobileProfileData;
};

function ProfileTabContent({
	activeStatus,
	activeTab,
	copy,
	isRtl,
	onChangePassword,
	onLogout,
	onStatusChange,
	profile,
}: TProfileTabContentProps) {
	if (activeTab === 'profile') {
		return (
			<ProfileDetails
				copy={copy}
				isRtl={isRtl}
				profile={profile}
			/>
		);
	}

	if (activeTab === 'bonuses') {
		return (
			<BonusDetails
				bonusPoints={profile.bonusPoints}
				copy={copy}
				isRtl={isRtl}
			/>
		);
	}

	if (activeTab === 'settings') {
		return (
			<ProfileSettings
				copy={copy}
				isRtl={isRtl}
				onChangePassword={onChangePassword}
				onLogout={onLogout}
			/>
		);
	}

	return (
		<ProfileList
			activeStatus={activeStatus}
			activeTab={activeTab}
			copy={copy}
			isRtl={isRtl}
			onStatusChange={onStatusChange}
		/>
	);
}

type TProfileDetailsProps = {
	copy: TProfileTranslations;
	isRtl: boolean;
	profile: TMobileProfileData;
};

function ProfileDetails({
	copy,
	isRtl,
	profile,
}: TProfileDetailsProps) {
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
					<Text style={[styles.identityPhone, isRtl && styles.rtlText]}>
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
							style={[styles.rowValue, isRtl && styles.rtlText]}
						>
							{row.value}
						</Text>
					</View>
				))}
			</View>
		</View>
	);
}

type TBonusDetailsProps = {
	bonusPoints: number;
	copy: TProfileTranslations;
	isRtl: boolean;
};

function BonusDetails({
	bonusPoints,
	copy,
	isRtl,
}: TBonusDetailsProps) {
	return (
		<EmptyProfileState
			description={copy.bonusDescription}
			icon='gift'
			isRtl={isRtl}
			title={[copy.bonusText, bonusPoints, copy.bonuses].join(' ')}
		/>
	);
}

type TProfileSettingsProps = {
	copy: TProfileTranslations;
	isRtl: boolean;
	onChangePassword: () => void;
	onLogout: () => void;
};

function ProfileSettings({
	copy,
	isRtl,
	onChangePassword,
	onLogout,
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

			<Pressable
				accessibilityRole='button'
				onPress={onChangePassword}
				style={({ pressed }) => [
					styles.actionRow,
					isRtl && styles.rowRtl,
					pressed && styles.pressed,
				]}
			>
				<Feather name='lock' size={18} color={Colors.accent} />
				<Text style={[styles.actionText, isRtl && styles.rtlText]}>
					{copy.changePassword}
				</Text>
				<Feather name={chevron} size={18} color={Colors.foreground} />
			</Pressable>

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
		</View>
	);
}

type TProfileListProps = {
	activeStatus: TProfileOrderStatus;
	activeTab: 'bookings' | 'favorites' | 'orders';
	copy: TProfileTranslations;
	isRtl: boolean;
	onStatusChange: (status: TProfileOrderStatus) => void;
};

function ProfileList({
	activeStatus,
	activeTab,
	copy,
	isRtl,
	onStatusChange,
}: TProfileListProps) {
	const isOrders = activeTab === 'orders';
	const title = isOrders ? copy.emptyOrders : copy.emptyBookings;
	const description = isOrders
		? copy.emptyOrdersText
		: copy.emptyBookingsText;

	if (activeTab === 'favorites') {
		return (
			<EmptyProfileState
				icon='heart'
				isRtl={isRtl}
				title={copy.emptyFavorites}
				description={copy.emptyFavoritesText}
			/>
		);
	}

	return (
		<View style={styles.list}>
			{isOrders && (
				<OrderStatuses
					activeStatus={activeStatus}
					copy={copy}
					onStatusChange={onStatusChange}
				/>
			)}
			<EmptyProfileState
				icon={isOrders ? 'shopping-bag' : 'calendar'}
				isRtl={isRtl}
				title={title}
				description={description}
			/>
		</View>
	);
}

type TOrderStatusesProps = {
	activeStatus: TProfileOrderStatus;
	copy: TProfileTranslations;
	onStatusChange: (status: TProfileOrderStatus) => void;
};

function OrderStatuses({
	activeStatus,
	copy,
	onStatusChange,
}: TOrderStatusesProps) {
	const statuses: {
		key: TProfileOrderStatus;
		label: string;
	}[] = [
		{ key: 'all', label: copy.allOrders },
		{ key: 'processing', label: copy.processingOrders },
		{ key: 'ready', label: copy.readyOrders },
		{ key: 'completed', label: copy.completedOrders },
	];

	return (
		<View style={styles.statuses}>
			{statuses.map(status => (
				<Pressable
					key={status.key}
					onPress={() => onStatusChange(status.key)}
					style={({ pressed }) => [
						styles.status,
						activeStatus === status.key && styles.activeStatus,
						pressed && styles.pressed,
					]}
				>
					<Text style={styles.statusText}>{status.label}</Text>
				</Pressable>
			))}
		</View>
	);
}

type TEmptyProfileStateProps = {
	description: string;
	icon: 'calendar' | 'gift' | 'heart' | 'shopping-bag';
	isRtl: boolean;
	title: string;
};

function EmptyProfileState({
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

const styles = StyleSheet.create({
	content: {
		padding: Spacing.medium,
		paddingBottom: Spacing.xLarge,
	},
	greeting: {
		marginTop: Spacing.medium,
		gap: 6,
	},
	eyebrow: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
	},
	title: {
		color: Colors.foreground,
		fontFamily: Fonts.serif,
		fontSize: 31,
		lineHeight: 38,
	},
	greetingText: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
	},
	bonusCard: {
		marginTop: Spacing.large,
		padding: Spacing.medium,
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.small,
		borderRadius: 18,
		backgroundColor: '#EFE4D8',
	},
	bonusIcon: {
		width: 44,
		height: 44,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 22,
		backgroundColor: Colors.background,
	},
	bonusCopy: {
		flex: 1,
		gap: 3,
	},
	bonusTitle: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 11,
		letterSpacing: 1,
		textTransform: 'uppercase',
	},
	bonusText: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 15,
		fontWeight: '600',
	},
	bonusValue: {
		color: Colors.accent,
	},
	tabs: {
		marginTop: Spacing.large,
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	tabsRtl: {
		flexDirection: 'row-reverse',
	},
	tab: {
		width: '33.333%',
		minHeight: 44,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: 2,
		borderBottomColor: 'transparent',
	},
	activeTab: {
		borderBottomColor: Colors.accent,
	},
	tabText: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
	},
	activeTabText: {
		color: Colors.foreground,
		fontWeight: '700',
	},
	detailsCard: {
		marginTop: Spacing.medium,
		padding: Spacing.medium,
		gap: Spacing.medium,
		borderWidth: 1,
		borderColor: '#E5DCD3',
		borderRadius: 18,
		backgroundColor: 'rgba(255, 255, 255, 0.78)',
	},
	profileIdentity: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.small,
	},
	identityRtl: {
		flexDirection: 'row-reverse',
	},
	avatar: {
		width: 66,
		height: 66,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 33,
		backgroundColor: '#E7D7C8',
	},
	avatarText: {
		color: Colors.accent,
		fontFamily: Fonts.sans,
		fontSize: 18,
		fontWeight: '600',
	},
	identityCopy: {
		flex: 1,
		gap: 4,
	},
	identityName: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 18,
		fontWeight: '700',
	},
	identityEmail: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
	},
	identityPhone: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
	},
	rows: {
		paddingVertical: Spacing.small,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: '#E5DCD3',
	},
	row: {
		minHeight: 42,
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.small,
	},
	rowRtl: {
		flexDirection: 'row-reverse',
	},
	rowLabel: {
		width: 96,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
	},
	rowValue: {
		flex: 1,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 13,
		fontWeight: '600',
		textAlign: 'right',
	},
	actionRow: {
		minHeight: 48,
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.small,
	},
	settingsCard: {
		marginTop: Spacing.medium,
		paddingHorizontal: Spacing.medium,
		borderWidth: 1,
		borderColor: '#E5DCD3',
		borderRadius: 18,
		backgroundColor: 'rgba(255, 255, 255, 0.78)',
	},
	settingsTitle: {
		marginTop: Spacing.medium,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 18,
		fontWeight: '700',
	},
	settingsText: {
		marginTop: 5,
		marginBottom: Spacing.small,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
		lineHeight: 19,
	},
	actionText: {
		flex: 1,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '600',
	},
	logoutRow: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: '#F3D2CE',
	},
	logoutText: {
		flex: 1,
		color: '#C95C52',
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '600',
	},
	list: {
		marginTop: Spacing.medium,
	},
	statuses: {
		padding: 4,
		flexDirection: 'row',
		gap: 4,
		borderRadius: 12,
		backgroundColor: '#EFE4D8',
	},
	status: {
		flex: 1,
		minHeight: 36,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 9,
	},
	activeStatus: {
		backgroundColor: Colors.background,
	},
	statusText: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 11,
		fontWeight: '600',
	},
	emptyState: {
		marginTop: Spacing.medium,
		padding: Spacing.xLarge,
		alignItems: 'center',
		gap: Spacing.small,
		borderWidth: 1,
		borderColor: '#E5DCD3',
		borderRadius: 18,
		backgroundColor: 'rgba(255, 255, 255, 0.78)',
	},
	emptyIcon: {
		width: 52,
		height: 52,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 26,
		backgroundColor: '#EFE4D8',
	},
	emptyTitle: {
		marginTop: Spacing.small,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 17,
		fontWeight: '700',
		textAlign: 'center',
	},
	emptyText: {
		maxWidth: 280,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
		lineHeight: 19,
		textAlign: 'center',
	},
	pressed: {
		opacity: 0.65,
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
