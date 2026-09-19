import { StyleSheet } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

export const adminContentStyles = StyleSheet.create({
	content: {
		paddingHorizontal: Spacing.medium,
		paddingTop: Spacing.medium,
		paddingBottom: 48,
		gap: Spacing.large,
	},
	heading: {
		gap: 5,
	},
	eyebrow: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 11,
		fontWeight: '600',
		letterSpacing: 1.6,
		textTransform: 'uppercase',
	},
	title: {
		color: Colors.foreground,
		fontFamily: Fonts.serif,
		fontSize: 36,
		lineHeight: 42,
	},
	subtitle: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
	},
	userBadge: {
		alignSelf: 'flex-start',
		minHeight: 38,
		marginTop: 10,
		paddingHorizontal: 13,
		flexDirection: 'row',
		alignItems: 'center',
		gap: 7,
		borderWidth: 1,
		borderColor: '#DED2C6',
		borderRadius: 999,
		backgroundColor: 'rgba(255,255,255,0.68)',
	},
	rtlRow: {
		flexDirection: 'row-reverse',
	},
	rtlBadge: {
		alignSelf: 'flex-end',
	},
	userName: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 13,
		fontWeight: '600',
	},
	placeholder: {
		minHeight: 360,
		padding: Spacing.large,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#E3D7CB',
		borderRadius: 24,
		backgroundColor: 'rgba(255,255,255,0.78)',
	},
	placeholderIcon: {
		width: 54,
		height: 54,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 27,
		backgroundColor: '#F0E4D7',
	},
	placeholderTitle: {
		marginTop: Spacing.medium,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 22,
		fontWeight: '700',
		textAlign: 'center',
	},
	placeholderText: {
		maxWidth: 290,
		marginTop: Spacing.small,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
		lineHeight: 21,
		textAlign: 'center',
	},
	logout: {
		minHeight: 50,
		paddingHorizontal: Spacing.medium,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: Spacing.small,
		borderWidth: 1,
		borderColor: '#E8CACA',
		borderRadius: 16,
		backgroundColor: '#FFF8F7',
	},
	logoutText: {
		color: '#C65353',
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '700',
	},
	rtlText: {
		textAlign: 'right',
		writingDirection: 'rtl',
	},
	pressed: {
		opacity: 0.7,
	},
});
