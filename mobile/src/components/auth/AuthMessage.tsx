import { StyleSheet, Text } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

type TAuthMessageProps = {
	children: string;
	isRtl: boolean;
};

export default function AuthMessage({
	children,
	isRtl,
}: TAuthMessageProps) {
	return (
		<Text style={[styles.message, isRtl && styles.rtlText]}>
			{children}
		</Text>
	);
}

const styles = StyleSheet.create({
	message: {
		padding: Spacing.medium,
		borderRadius: 14,
		backgroundColor: '#EFE5DA',
		color: Colors.accent,
		fontFamily: Fonts.sans,
		fontSize: 13,
		lineHeight: 19,
		textAlign: 'center',
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
