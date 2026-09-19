import { StyleSheet } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export const adminNavigationStyles = StyleSheet.create({
	navigation: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: Spacing.small,
	},
	rtlRow: {
		flexDirection: 'row-reverse',
	},
	item: {
		width: '48.5%',
		minHeight: 44,
		paddingHorizontal: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 7,
		borderWidth: 1,
		borderColor: '#DED2C6',
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.72)',
	},
	activeItem: {
		borderColor: Colors.accent,
		backgroundColor: Colors.accent,
	},
	label: {
		flexShrink: 1,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
		fontWeight: '600',
	},
	activeLabel: {
		color: Colors.white,
	},
	rtlText: {
		textAlign: 'right',
		writingDirection: 'rtl',
	},
	pressed: {
		opacity: 0.72,
	},
});
