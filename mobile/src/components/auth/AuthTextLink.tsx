import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Fonts } from '@/constants/theme';

type TAuthTextLinkProps = {
	isRtl: boolean;
	label: string;
	onPress: () => void;
	tone?: 'accent' | 'muted';
};

export default function AuthTextLink({
	isRtl,
	label,
	onPress,
	tone = 'accent',
}: TAuthTextLinkProps) {
	return (
		<Pressable
			accessibilityRole='button'
			onPress={onPress}
			style={styles.button}
		>
			<Text
				style={[
					tone === 'accent' ? styles.accent : styles.muted,
					isRtl && styles.rtlText,
				]}
			>
				{label}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		alignItems: 'center',
	},
	accent: {
		color: Colors.accent,
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '600',
	},
	muted: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
