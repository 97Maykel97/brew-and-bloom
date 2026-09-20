import { StyleSheet } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export const homeScreenStyles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scrollContent: {
		flexGrow: 1,
	},
	content: {
		minHeight: 600,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: Spacing.large,
		paddingVertical: 48,
	},
	eyebrow: {
		marginBottom: Spacing.medium,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 2,
		textTransform: 'uppercase',
	},
	title: {
		color: Colors.foreground,
		fontFamily: Fonts.serif,
		fontSize: 56,
		lineHeight: 58,
		textAlign: 'center',
	},
	subtitle: {
		marginTop: Spacing.large,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
	},
	description: {
		maxWidth: 340,
		marginTop: Spacing.small,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 15,
		lineHeight: 23,
		textAlign: 'center',
	},
	rtlText: {
		writingDirection: 'rtl',
	},
	button: {
		minHeight: 52,
		marginTop: Spacing.xLarge,
		paddingHorizontal: Spacing.large,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: Spacing.small,
		borderRadius: 999,
		backgroundColor: Colors.accent,
	},
	buttonPressed: {
		opacity: 0.82,
		transform: [{ scale: 0.98 }],
	},
	rtlButton: {
		flexDirection: 'row-reverse',
	},
	buttonText: {
		color: Colors.white,
		fontFamily: Fonts.sans,
		fontSize: 15,
		fontWeight: '700',
	},
	buttonArrow: {
		color: Colors.white,
		fontSize: 19,
		lineHeight: 21,
	},
	note: {
		marginTop: Spacing.xLarge,
		color: Colors.muted,
		fontFamily: Fonts.serif,
		fontSize: 22,
		fontStyle: 'italic',
		lineHeight: 27,
		textAlign: 'center',
	},
});
