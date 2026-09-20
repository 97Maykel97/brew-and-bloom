import { StyleSheet } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export const homeHighlightsStyles = StyleSheet.create({
	section: {
		paddingHorizontal: Spacing.medium,
		paddingVertical: Spacing.small,
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderColor: 'rgba(74,50,36,0.1)',
		backgroundColor: 'rgba(255,252,248,0.96)',
	},
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	rtlGrid: {
		flexDirection: 'row-reverse',
	},
	item: {
		width: '50%',
		minHeight: 92,
		paddingHorizontal: 12,
		paddingVertical: 18,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 11,
	},
	rtlItem: {
		flexDirection: 'row-reverse',
	},
	secondColumn: {
		borderLeftWidth: 1,
		borderLeftColor: 'rgba(74,50,36,0.13)',
	},
	secondColumnRtl: {
		borderRightWidth: 1,
		borderRightColor: 'rgba(74,50,36,0.13)',
	},
	secondRow: {
		borderTopWidth: 1,
		borderTopColor: 'rgba(74,50,36,0.13)',
	},
	label: {
		flex: 1,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 12,
		fontWeight: '600',
		lineHeight: 17,
	},
	rtlText: {
		textAlign: 'right',
		writingDirection: 'rtl',
	},
});
