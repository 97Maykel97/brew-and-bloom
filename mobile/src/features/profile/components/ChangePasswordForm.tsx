import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/languages';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { supabase } from '@/lib/supabase';
import {
	doPasswordsMatch,
	isPasswordLongEnough,
} from '@/features/auth/lib/auth-validation';
import type { TProfileTranslations } from '../profileTranslations';

type TChangePasswordFormProps = {
	copy: TProfileTranslations;
	isRtl: boolean;
	locale: TLocale;
};

export default function ChangePasswordForm({
	copy,
	isRtl,
	locale,
}: TChangePasswordFormProps) {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [newPassword, setNewPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isSuccess, setIsSuccess] = useState<boolean>(false);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	async function handleSave() {
		setMessage('');
		setIsSuccess(false);

		if (!isPasswordLongEnough(newPassword)) {
			setMessage(copy.passwordLength);
			return;
		}

		if (!doPasswordsMatch(newPassword, confirmPassword)) {
			setMessage(copy.passwordMismatch);
			return;
		}

		setIsSaving(true);

		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			setNewPassword('');
			setConfirmPassword('');
			setIsSuccess(true);
			setMessage(copy.passwordChanged);
		} catch (error: unknown) {
			setMessage(
				getAuthErrorMessage(error, locale) || copy.passwordChangeError,
			);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<View style={styles.card}>
			<Pressable
				accessibilityRole='button'
				accessibilityState={{ expanded: isOpen }}
				onPress={() => setIsOpen(value => !value)}
				style={({ pressed }) => [
					styles.toggle,
					isRtl && styles.rowRtl,
					pressed && styles.pressed,
				]}
			>
				<Feather name='lock' size={18} color={Colors.accent} />
				<Text style={[styles.toggleText, isRtl && styles.rtlText]}>
					{copy.changePassword}
				</Text>
				<Feather
					name={isOpen ? 'chevron-up' : 'chevron-down'}
					size={18}
					color={Colors.foreground}
				/>
			</Pressable>

			{isOpen ? (
				<View style={styles.form}>
					<Text style={[styles.description, isRtl && styles.rtlText]}>
						{copy.changePasswordDescription}
					</Text>
					<PasswordField
						label={copy.newPassword}
						isRtl={isRtl}
						autoComplete='new-password'
						value={newPassword}
						onChangeText={setNewPassword}
						showPasswordLabel={copy.showPassword}
						hidePasswordLabel={copy.hidePassword}
					/>
					<PasswordField
						label={copy.confirmNewPassword}
						isRtl={isRtl}
						autoComplete='new-password'
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						showPasswordLabel={copy.showPassword}
						hidePasswordLabel={copy.hidePassword}
					/>

					{message ? (
						<Text
							style={[
								styles.message,
								isSuccess ? styles.success : styles.error,
								isRtl && styles.rtlText,
							]}
						>
							{message}
						</Text>
					) : null}

					<AuthSubmitButton
						label={copy.savePassword}
						loadingLabel={copy.changingPassword}
						isLoading={isSaving}
						onPress={handleSave}
					/>
				</View>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		overflow: 'hidden',
		borderWidth: 1,
		borderColor: '#E5DCD3',
		borderRadius: 14,
		backgroundColor: '#FCFAF7',
	},
	toggle: {
		minHeight: 52,
		paddingHorizontal: 14,
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.small,
	},
	toggleText: {
		flex: 1,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '600',
	},
	form: {
		padding: 14,
		gap: Spacing.medium,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: '#E5DCD3',
	},
	description: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 12,
		lineHeight: 18,
	},
	message: {
		padding: 10,
		borderRadius: 10,
		fontFamily: Fonts.sans,
		fontSize: 12,
		textAlign: 'center',
	},
	success: {
		backgroundColor: '#E7F5EC',
		color: '#287A48',
	},
	error: {
		backgroundColor: '#FFF0EE',
		color: '#C95C52',
	},
	rowRtl: {
		flexDirection: 'row-reverse',
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
	pressed: {
		opacity: 0.65,
	},
});
