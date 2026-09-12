import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

type TAuthSubmitButtonProps = {
	label: string;
	loadingLabel: string;
	isLoading: boolean;
	onPress: () => void;
};

export default function AuthSubmitButton({
	label,
	loadingLabel,
	isLoading,
	onPress,
}: TAuthSubmitButtonProps) {
	return (
		<Pressable
			accessibilityRole='button'
			disabled={isLoading}
			onPress={onPress}
			style={({ pressed }) => [
				styles.button,
				pressed && styles.pressed,
				isLoading && styles.disabled,
			]}
		>
			{isLoading ? (
				<>
					<ActivityIndicator color={Colors.white} />
					<Text style={styles.loadingText}>{loadingLabel}</Text>
				</>
			) : (
				<Text style={styles.text}>{label}</Text>
			)}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		minHeight: 52,
		marginTop: Spacing.small,
		paddingHorizontal: Spacing.large,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: Spacing.small,
		borderRadius: 999,
		backgroundColor: Colors.accent,
		shadowColor: Colors.foreground,
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.18,
		shadowRadius: 12,
		elevation: 4,
	},
	text: {
		color: Colors.white,
		fontFamily: Fonts.sans,
		fontSize: 15,
		fontWeight: '700',
	},
	loadingText: {
		color: Colors.white,
		fontFamily: Fonts.sans,
		fontSize: 13,
	},
	pressed: {
		opacity: 0.82,
		transform: [{ scale: 0.98 }],
	},
	disabled: {
		opacity: 0.65,
	},
});
