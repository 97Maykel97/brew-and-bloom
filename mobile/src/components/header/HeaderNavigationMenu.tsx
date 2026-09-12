import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';

type THeaderNavigationMenuProps = {
	visible: boolean;
	height: number;
	isRtl: boolean;
	items: string[];
	onClose: () => void;
};

export default function HeaderNavigationMenu({
	visible,
	height,
	isRtl,
	items,
	onClose,
}: THeaderNavigationMenuProps) {
	if (!visible) {
		return null;
	}

	return (
		<View style={[styles.layer, { height }]}>
			<Pressable
				accessibilityLabel='Close menu'
				accessibilityRole='button'
				onPress={onClose}
				style={styles.backdrop}
			/>

			<View style={styles.menu}>
				<ScrollView
					contentContainerStyle={styles.content}
					showsVerticalScrollIndicator={false}
				>
					{items.map(item => (
						<Pressable
							accessibilityRole='link'
							key={item}
							onPress={onClose}
							style={({ pressed }) => [
								styles.item,
								pressed && styles.pressed,
							]}
						>
							<Text style={[styles.itemText, isRtl && styles.rtlText]}>
								{item}
							</Text>
						</Pressable>
					))}
				</ScrollView>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	layer: {
		position: 'absolute',
		top: 72,
		left: 0,
		right: 0,
		zIndex: 9,
	},
	backdrop: {
		position: 'absolute',
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: 'rgba(43, 33, 27, 0.16)',
	},
	menu: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		maxHeight: 420,
		backgroundColor: Colors.background,
		shadowColor: Colors.foreground,
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.14,
		shadowRadius: 12,
		elevation: 8,
	},
	content: {
		paddingHorizontal: Spacing.large,
		paddingVertical: Spacing.medium,
		gap: Spacing.small,
	},
	item: {
		minHeight: 52,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: '#D8CEC3',
	},
	itemText: {
		color: Colors.foreground,
		fontFamily: Fonts.serif,
		fontSize: 24,
	},
	rtlText: {
		writingDirection: 'rtl',
	},
	pressed: {
		opacity: 0.55,
	},
});
