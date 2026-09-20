import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import brandLogo from '@/assets/images/brand-logo.png';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/translations';
import { createLocalizedHref } from '@/lib/createLocalizedHref';

type THeaderNavigationMenuProps = {
	isRtl: boolean;
	items: string[];
	locale: TLocale;
	onClose: () => void;
	visible: boolean;
};

const NAVIGATION_ROUTES = [
	'/',
	'/menu',
	'/about',
	'/events',
	'/contacts',
] as const;

export default function HeaderNavigationMenu({
	isRtl,
	items,
	locale,
	onClose,
	visible,
}: THeaderNavigationMenuProps) {
	const insets = useSafeAreaInsets();
	const navigationItems = NAVIGATION_ROUTES.map((pathname, index) => ({
		label: items[index],
		pathname,
	})).filter(item => Boolean(item.label));

	function navigateTo(pathname: (typeof NAVIGATION_ROUTES)[number]) {
		onClose();
		router.navigate(createLocalizedHref(pathname, locale));
	}

	return (
		<Modal
			animationType='fade'
			onRequestClose={onClose}
			transparent
			visible={visible}
		>
			<View style={[styles.modal, isRtl && styles.rtlModal]}>
				<Pressable
					accessibilityLabel='Close menu'
					accessibilityRole='button'
					onPress={onClose}
					style={styles.backdrop}
				/>
				<View
					style={[
						styles.menu,
						{
							paddingTop: Math.max(insets.top, Spacing.medium),
							paddingBottom: Math.max(insets.bottom, Spacing.small),
						},
					]}
				>
					<View style={[styles.menuHeader, isRtl && styles.rtlRow]}>
						<Image
							alt='Brew & Bloom'
							contentFit='contain'
							source={brandLogo}
							style={styles.logo}
						/>
						<Pressable
							accessibilityLabel='Close menu'
							accessibilityRole='button'
							onPress={onClose}
							style={styles.closeButton}
						>
							<Feather name='x' size={24} color={Colors.foreground} />
						</Pressable>
					</View>

					<ScrollView
						contentContainerStyle={styles.content}
						showsVerticalScrollIndicator={false}
					>
						{navigationItems.map(item => (
							<Pressable
								accessibilityRole='link'
								key={item.pathname}
								onPress={() => navigateTo(item.pathname)}
								style={({ pressed }) => [
									styles.item,
									isRtl && styles.rtlRow,
									pressed && styles.pressed,
								]}
							>
								<Text style={[styles.itemText, isRtl && styles.rtlText]}>
									{item.label}
								</Text>
								<Feather
									name={isRtl ? 'chevron-left' : 'chevron-right'}
									size={18}
									color={Colors.muted}
								/>
							</Pressable>
						))}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	modal: {
		flex: 1,
		flexDirection: 'row',
	},
	rtlModal: {
		flexDirection: 'row-reverse',
	},
	backdrop: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: 'rgba(43, 33, 27, 0.28)',
	},
	menu: {
		width: '78%',
		maxWidth: 320,
		backgroundColor: Colors.background,
		shadowColor: Colors.foreground,
		shadowOffset: { width: 4, height: 0 },
		shadowOpacity: 0.18,
		shadowRadius: 14,
		elevation: 12,
	},
	menuHeader: {
		minHeight: 64,
		paddingHorizontal: Spacing.medium,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#D8CEC3',
	},
	logo: {
		width: 128,
		height: 42,
	},
	closeButton: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
	},
	content: {
		paddingHorizontal: Spacing.medium,
		paddingVertical: Spacing.medium,
	},
	item: {
		minHeight: 54,
		paddingHorizontal: Spacing.small,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#D8CEC3',
	},
	itemText: {
		color: Colors.foreground,
		fontFamily: Fonts.serif,
		fontSize: 19,
	},
	rtlRow: {
		flexDirection: 'row-reverse',
	},
	rtlText: {
		textAlign: 'right',
		writingDirection: 'rtl',
	},
	pressed: {
		opacity: 0.55,
	},
});
