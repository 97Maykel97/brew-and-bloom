import type { KeyboardTypeOptions, TextInputProps } from 'react-native';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

type TAuthFieldProps = TextInputProps & {
	label: string;
	isRtl: boolean;
	keyboardType?: KeyboardTypeOptions;
};

export default function AuthField({
	label,
	isRtl,
	keyboardType,
	style,
	...inputProps
}: TAuthFieldProps) {
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const isLtr =
		keyboardType === 'email-address' || keyboardType === 'phone-pad';
	const { onBlur, onFocus } = inputProps;

	return (
		<View style={styles.field}>
			<Text style={[styles.label, isRtl && styles.rtlText]}>{label}</Text>
			<TextInput
				{...inputProps}
				keyboardType={keyboardType}
				style={[
					styles.input,
					isFocused && styles.inputFocused,
					isRtl && !isLtr && styles.rtlInput,
					style,
				]}
				textAlign={isLtr ? 'left' : isRtl ? 'right' : 'left'}
				placeholderTextColor={Colors.muted}
				onFocus={event => {
					setIsFocused(true);
					onFocus?.(event);
				}}
				onBlur={event => {
					setIsFocused(false);
					onBlur?.(event);
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	field: {
		gap: 6,
	},
	label: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '600',
	},
	input: {
		height: 50,
		paddingHorizontal: Spacing.medium,
		borderWidth: 1,
		borderColor: '#D8CEC3',
		borderRadius: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.78)',
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 15,
	},
	inputFocused: {
		borderColor: Colors.accent,
		backgroundColor: '#EFE5DA',
	},
	rtlInput: {
		writingDirection: 'rtl',
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
