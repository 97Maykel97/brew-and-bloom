import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Colors, Fonts, Spacing } from '@/constants/theme';

type TPasswordFieldProps = TextInputProps & {
	label: string;
	isRtl: boolean;
	showPasswordLabel: string;
	hidePasswordLabel: string;
};

export default function PasswordField({
	label,
	isRtl,
	showPasswordLabel,
	hidePasswordLabel,
	style,
	...inputProps
}: TPasswordFieldProps) {
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [isFocused, setIsFocused] = useState<boolean>(false);
	const { onBlur, onFocus } = inputProps;

	return (
		<View style={styles.field}>
			<Text style={[styles.label, isRtl && styles.rtlText]}>{label}</Text>
			<View>
				<TextInput
					{...inputProps}
					secureTextEntry={!isVisible}
					style={[
						styles.input,
						isFocused && styles.inputFocused,
						isRtl && styles.rtlInput,
						style,
					]}
					textAlign={isRtl ? 'right' : 'left'}
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
				<Pressable
					accessibilityRole='button'
					accessibilityLabel={
						isVisible ? hidePasswordLabel : showPasswordLabel
					}
					onPress={() => setIsVisible(value => !value)}
					style={({ pressed }) => [
						styles.eyeButton,
						pressed && styles.pressed,
					]}
				>
					<Feather
						name={isVisible ? 'eye-off' : 'eye'}
						size={18}
						color={Colors.muted}
					/>
				</Pressable>
			</View>
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
		paddingRight: 52,
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
		paddingLeft: 52,
		paddingRight: Spacing.medium,
	},
	eyeButton: {
		position: 'absolute',
		top: 0,
		right: 4,
		width: 44,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pressed: {
		opacity: 0.55,
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
