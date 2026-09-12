import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import {
	languageOptions,
	type TLocale,
} from '@/i18n/languages';

type THeaderLanguageMenuProps = {
	locale: TLocale;
	visible: boolean;
	onClose: () => void;
	onSelect: (locale: TLocale) => void;
};

export default function HeaderLanguageMenu({
	locale,
	visible,
	onClose,
	onSelect,
}: THeaderLanguageMenuProps) {
	return (
		<Modal
			animationType='fade'
			onRequestClose={onClose}
			transparent
			visible={visible}
		>
			<Pressable style={styles.overlay} onPress={onClose}>
				<Pressable
					style={styles.menu}
					onPress={event => event.stopPropagation()}
				>
					{languageOptions
						.filter(option => option.locale !== locale)
						.map(option => (
							<Pressable
								accessibilityRole='button'
								key={option.locale}
								onPress={() => onSelect(option.locale)}
								style={({ pressed }) => [
									styles.option,
									pressed && styles.pressed,
								]}
							>
								<Text
									style={[
										styles.optionText,
										option.locale === 'he' && styles.rtlText,
									]}
								>
									{option.label} · {option.name}
								</Text>
							</Pressable>
						))}
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		alignItems: 'flex-end',
		paddingTop: 80,
		paddingRight: Spacing.large,
	},
	menu: {
		minWidth: 168,
		padding: Spacing.small,
		borderRadius: 12,
		backgroundColor: Colors.background,
		shadowColor: Colors.foreground,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.14,
		shadowRadius: 10,
		elevation: 6,
	},
	option: {
		minHeight: 44,
		paddingHorizontal: Spacing.small,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
	},
	optionText: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 14,
	},
	rtlText: {
		writingDirection: 'rtl',
	},
	pressed: {
		opacity: 0.55,
	},
});
