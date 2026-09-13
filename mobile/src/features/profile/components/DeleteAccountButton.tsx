import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import AuthField from '@/components/auth/AuthField';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import type { TLocale } from '@/i18n/translations';
import type { TProfileTranslations } from '../profileTranslations';

type TDeleteAccountButtonProps = {
	copy: TProfileTranslations;
	locale: TLocale;
};

type TDeleteStep = 'password' | 'code';

export default function DeleteAccountButton({
	copy,
	locale,
}: TDeleteAccountButtonProps) {
	const isRtl = locale === 'he';
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState<TDeleteStep>('password');
	const [password, setPassword] = useState('');
	const [code, setCode] = useState('');
	const [message, setMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	function openConfirmation() {
		setIsOpen(true);
		setStep('password');
		setPassword('');
		setCode('');
		setMessage('');
	}

	function closeConfirmation() {
		if (isLoading) return;
		setIsOpen(false);
		setMessage('');
	}

	async function sendCode() {
		if (!password || isLoading) return;

		setIsLoading(true);
		setMessage('');

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user?.email) {
				setMessage(copy.deleteError);
				return;
			}

			const { error: passwordError } =
				await supabase.auth.signInWithPassword({
					email: user.email,
					password,
				});

			if (passwordError) {
				setMessage(copy.invalidPassword);
				return;
			}

			const { error: codeError } = await supabase.auth.signInWithOtp({
				email: user.email,
				options: { shouldCreateUser: false },
			});

			if (codeError) {
				setMessage(copy.deleteError);
				return;
			}

			setStep('code');
			setMessage(copy.codeSent);
		} catch {
			setMessage(copy.deleteError);
		} finally {
			setIsLoading(false);
		}
	}

	async function confirmDeletion() {
		if (!code.trim() || isLoading) return;

		setIsLoading(true);
		setMessage('');

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user?.email) {
				setMessage(copy.deleteError);
				return;
			}

			const { error: verificationError } = await supabase.auth.verifyOtp({
				email: user.email,
				token: code.trim(),
				type: 'email',
			});

			if (verificationError) {
				setMessage(copy.invalidCode);
				return;
			}

			const { error: deleteError } = await supabase.rpc(
				'delete_current_user',
			);

			if (deleteError) {
				setMessage(copy.deleteError);
				return;
			}

			await supabase.auth.signOut();
			router.replace({
				pathname: '/auth/login',
				params: { locale },
			});
		} catch {
			setMessage(copy.deleteError);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<>
			<Pressable
				accessibilityRole='button'
				disabled={isLoading}
				onPress={openConfirmation}
				style={({ pressed }) => [
					styles.button,
					pressed && styles.pressed,
				]}
			>
				<Feather name='trash-2' size={18} color='#C95C52' />
				<Text style={styles.text}>{copy.deleteAccount}</Text>
			</Pressable>

			<Modal
				animationType='fade'
				transparent
				visible={isOpen}
				onRequestClose={closeConfirmation}
			>
				<Pressable style={styles.backdrop} onPress={closeConfirmation}>
					<Pressable
						style={styles.card}
						onPress={event => event.stopPropagation()}
					>
						<View style={styles.cardHeader}>
							<Text style={[styles.title, isRtl && styles.rtlText]}>
								{copy.deleteAccount}
							</Text>
							<Pressable
								accessibilityRole='button'
								disabled={isLoading}
								onPress={closeConfirmation}
							>
								<Feather name='x' size={20} color={Colors.muted} />
							</Pressable>
						</View>
						<Text style={[styles.description, isRtl && styles.rtlText]}>
							{copy.deleteConfirm}
						</Text>

						{step === 'password' ? (
							<View style={styles.form}>
								<AuthField
									label={copy.currentPassword}
									isRtl={isRtl}
									secureTextEntry
									value={password}
									onChangeText={setPassword}
									autoComplete='current-password'
								/>
								<AuthSubmitButton
									label={copy.sendCode}
									loadingLabel={copy.verifying}
									isLoading={isLoading}
									onPress={sendCode}
								/>
							</View>
						) : (
							<View style={styles.form}>
								<AuthField
									label={copy.verificationCode}
									isRtl={isRtl}
									keyboardType='number-pad'
									value={code}
									onChangeText={setCode}
									autoComplete='one-time-code'
								/>
								<AuthSubmitButton
									label={copy.deleteAccount}
									loadingLabel={copy.verifying}
									isLoading={isLoading}
									onPress={confirmDeletion}
								/>
							</View>
						)}

						{message ? (
							<AuthMessage isRtl={isRtl}>{message}</AuthMessage>
						) : null}
					</Pressable>
				</Pressable>
			</Modal>
		</>
	);
}

const styles = StyleSheet.create({
	button: {
		minHeight: 48,
		flexDirection: 'row',
		alignItems: 'center',
		gap: Spacing.small,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: '#F3D2CE',
	},
	text: {
		flex: 1,
		color: '#C95C52',
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '600',
	},
	backdrop: {
		flex: 1,
		justifyContent: 'center',
		padding: Spacing.large,
		backgroundColor: 'rgba(43, 33, 27, 0.42)',
	},
	card: {
		padding: Spacing.large,
		borderRadius: 22,
		backgroundColor: Colors.background,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: Spacing.small,
	},
	title: {
		flex: 1,
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 19,
		fontWeight: '700',
	},
	description: {
		marginTop: Spacing.small,
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 13,
		lineHeight: 19,
	},
	form: {
		marginTop: Spacing.medium,
		gap: Spacing.medium,
	},
	pressed: {
		opacity: 0.65,
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
