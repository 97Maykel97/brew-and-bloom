import { StyleSheet } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export const adminOverviewStyles = StyleSheet.create({
	wrapper: {
		gap: Spacing.medium,
	},
	statistics: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 10,
	},
	rtlRow: {
		flexDirection: 'row-reverse',
	},
	statCard: {
		width: '48.5%',
		minHeight: 150,
		padding: Spacing.medium,
		justifyContent: 'space-between',
		borderWidth: 1,
		borderColor: '#E3D7CB',
		borderRadius: 20,
		backgroundColor: 'rgba(255,255,255,0.78)',
	},
	iconCircle: {
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 20,
		backgroundColor: '#F0E4D7',
	},
	value: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 25,
		fontWeight: '700',
	},
	statLabel: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
	},
	activityCard: {
		padding: Spacing.medium,
		borderWidth: 1,
		borderColor: '#E3D7CB',
		borderRadius: 24,
		backgroundColor: 'rgba(255,255,255,0.78)',
	},
	activityTitle: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 18,
		fontWeight: '700',
	},
	emptyActivity: {
		minHeight: 190,
		marginTop: Spacing.medium,
		padding: Spacing.large,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: '#DCCFC2',
		borderRadius: 18,
		backgroundColor: '#FBF8F4',
	},
	emptyIcon: {
		width: 48,
		height: 48,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 24,
		backgroundColor: '#F0E4D7',
	},
	emptyText: {
		maxWidth: 260,
		marginTop: 14,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
		lineHeight: 21,
		textAlign: 'center',
	},
	rtlText: {
		textAlign: 'right',
		writingDirection: 'rtl',
	},
});
