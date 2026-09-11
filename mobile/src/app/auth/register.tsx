import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { createElement, useState, type ChangeEvent } from 'react';
import {
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import AuthField from '@/components/auth/AuthField';
import AuthScreen from '@/components/auth/AuthScreen';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import PasswordField from '@/components/auth/PasswordField';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { authTranslations } from '@/i18n/authTranslations';
import { getLocale } from '@/i18n/locale';
import { getAuthErrorMessage } from '@/lib/auth/getAuthErrorMessage';
import { normalizePhone } from '@/lib/auth/normalizePhone';
import { supabase } from '@/lib/supabase';

function isValidBirthDate(value: string): boolean {
	const [year, month, day] = value.split('-').map(Number);
	const birthDate = new Date(year, month - 1, day);
	const today = new Date();
	const oldestAllowedDate = new Date(
		today.getFullYear() - 120,
		today.getMonth(),
		today.getDate(),
	);

	return (
		Number.isInteger(year) &&
		Number.isInteger(month) &&
		Number.isInteger(day) &&
		birthDate.getFullYear() === year &&
		birthDate.getMonth() === month - 1 &&
		birthDate.getDate() === day &&
		birthDate <= today &&
		birthDate >= oldestAllowedDate
	);
}

function formatDateForSupabase(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return [year, month, day].join('-');
}

function formatDateForDisplay(value: string, locale: string): string {
	const [year, month, day] = value.split('-');
	if (!year || !month || !day) return '';
	return locale === 'en'
		? [month, day, year].join('/')
		: [day, month, year].join('.');
}

type WebDateInputProps = {
	label: string;
	isRtl: boolean;
	value: string;
	minimumDate: string;
	maximumDate: string;
	onChange: (value: string) => void;
};

function WebDateInput({
	label,
	isRtl,
	value,
	minimumDate,
	maximumDate,
	onChange,
}: WebDateInputProps) {
	const inputStyle = {
		width: '100%',
		height: 50,
		padding: '0 16px',
		border: '1px solid #D8CEC3',
		borderRadius: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.78)',
		color: '#2B211B',
		fontFamily: 'system-ui',
		fontSize: 15,
		boxSizing: 'border-box' as const,
		textAlign: isRtl ? 'right' : 'left',
	};

	return createElement('input', {
		type: 'date',
		'aria-label': label,
		dir: isRtl ? 'rtl' : 'ltr',
		min: minimumDate,
		max: maximumDate,
		value,
		onChange: (event: ChangeEvent<HTMLInputElement>) =>
			onChange(event.target.value),
		style: inputStyle,
	});
}

export default function RegisterScreen() {
	const params = useLocalSearchParams<{ locale?: string }>();
	const locale = getLocale(params.locale);
	const [firstName, setFirstName] = useState<string>('');
	const [lastName, setLastName] = useState<string>('');
	const [birthDate, setBirthDate] = useState<string>('');
	const [selectedDate, setSelectedDate] = useState<Date>(
		new Date(2000, 0, 1),
	);
	const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
	const [phone, setPhone] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [confirmPassword, setConfirmPassword] = useState<string>('');
	const [message, setMessage] = useState<string>('');
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const content = authTranslations[locale];
	const isRtl = locale === 'he';
	const today = new Date();
	const minimumBirthDate = new Date(
		today.getFullYear() - 120,
		today.getMonth(),
		today.getDate(),
	);

	function handleLocaleChange(nextLocale: typeof locale) {
		router.setParams({ locale: nextLocale });
	}

	function handleDateChange(_: unknown, date?: Date) {
		if (Platform.OS === 'android') {
			setIsDatePickerOpen(false);
		}

		if (date) {
			setSelectedDate(date);
			setBirthDate(formatDateForSupabase(date));
		}
	}

	async function handleRegister() {
		setMessage('');
		const normalizedEmail = email.trim();
		const normalizedPhone = normalizePhone(phone);

		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!birthDate ||
			!normalizedPhone ||
			!normalizedEmail ||
			!password ||
			!confirmPassword
		) {
			setMessage(content.form.requiredFields);
			return;
		}

		if (!isValidBirthDate(birthDate)) {
			setMessage(content.register.invalidBirthDate);
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
			setMessage(content.form.invalidEmail);
			return;
		}

		if (password.length < 6) {
			setMessage(content.register.passwordLength);
			return;
		}

		if (password !== confirmPassword) {
			setMessage(content.register.passwordMismatch);
			return;
		}

		setIsLoading(true);

		try {
			const displayName = [firstName.trim(), lastName.trim()].join(' ');
			const { data, error } = await supabase.auth.signUp({
				email: normalizedEmail,
				password,
				options: {
					data: {
						first_name: firstName.trim(),
						last_name: lastName.trim(),
						full_name: displayName,
						display_name: displayName,
						birth_date: birthDate,
						phone: normalizedPhone,
					},
				},
			});

			if (error) {
				setMessage(getAuthErrorMessage(error, locale));
				return;
			}

			if (data.user?.identities?.length === 0) {
				setMessage(content.form.accountAlreadyExists);
				return;
			}

			if (!data.session) {
				setMessage(content.register.confirmEmail);
				return;
			}

			router.replace({ pathname: '/', params: { locale } });
		} catch (error: unknown) {
			setMessage(getAuthErrorMessage(error, locale));
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<AuthScreen
			locale={locale}
			onLocaleChange={handleLocaleChange}
			title={content.register.title}
		>
			<AuthField
				label={content.register.firstName}
				isRtl={isRtl}
				autoComplete='given-name'
				value={firstName}
				onChangeText={setFirstName}
			/>
			<AuthField
				label={content.register.lastName}
				isRtl={isRtl}
				autoComplete='family-name'
				value={lastName}
				onChangeText={setLastName}
			/>
			<View style={styles.dateField}>
				<Text style={[styles.dateLabel, isRtl && styles.rtlText]}>
					{content.register.birthDate}
				</Text>
				{Platform.OS === 'web' ? (
					<WebDateInput
						label={content.register.birthDate}
						isRtl={isRtl}
						value={birthDate}
						minimumDate={formatDateForSupabase(minimumBirthDate)}
						maximumDate={formatDateForSupabase(today)}
						onChange={setBirthDate}
					/>
				) : (
					<Pressable
						accessibilityRole='button'
						accessibilityLabel={content.register.birthDate}
						onPress={() => setIsDatePickerOpen(true)}
						style={({ pressed }) => [
							styles.dateButton,
							pressed && styles.pressed,
						]}
					>
						<Text
							style={[
								styles.dateText,
								!birthDate && styles.datePlaceholder,
								isRtl && styles.rtlText,
							]}
						>
							{formatDateForDisplay(birthDate, locale) || 'DD.MM.YYYY'}
						</Text>
					</Pressable>
				)}
			</View>
			<AuthField
				label={content.register.phone}
				isRtl={isRtl}
				keyboardType='phone-pad'
				placeholder='+972 50 123 4567'
				value={phone}
				onChangeText={setPhone}
			/>
			<AuthField
				label={content.register.email}
				isRtl={isRtl}
				keyboardType='email-address'
				autoCapitalize='none'
				autoCorrect={false}
				autoComplete='email'
				value={email}
				onChangeText={setEmail}
			/>
			<PasswordField
				label={content.register.password}
				isRtl={isRtl}
				autoComplete='new-password'
				value={password}
				onChangeText={setPassword}
				showPasswordLabel={content.form.showPassword}
				hidePasswordLabel={content.form.hidePassword}
			/>
			<PasswordField
				label={content.register.confirmPassword}
				isRtl={isRtl}
				autoComplete='new-password'
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				showPasswordLabel={content.form.showPassword}
				hidePasswordLabel={content.form.hidePassword}
			/>
			<AuthSubmitButton
				label={content.register.submit}
				loadingLabel={content.register.loading}
				isLoading={isLoading}
				onPress={handleRegister}
			/>

			{message ? (
				<Text style={[styles.message, isRtl && styles.rtlText]}>
					{message}
				</Text>
			) : null}

			<Pressable
				onPress={() =>
					router.replace({
						pathname: '/auth/login',
						params: { locale },
					})
				}
				style={styles.linkButton}
			>
				<Text style={[styles.mutedLink, isRtl && styles.rtlText]}>
					{content.register.loginLink}
				</Text>
			</Pressable>

			<Modal
				animationType='fade'
				transparent
				visible={isDatePickerOpen}
				onRequestClose={() => setIsDatePickerOpen(false)}
			>
				<Pressable
					style={styles.pickerBackdrop}
					onPress={() => setIsDatePickerOpen(false)}
				>
					<Pressable
						style={styles.pickerCard}
						onPress={event => event.stopPropagation()}
					>
						<DateTimePicker
							value={selectedDate}
							mode='date'
							display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
							minimumDate={minimumBirthDate}
							maximumDate={today}
							onChange={handleDateChange}
						/>
						{Platform.OS === 'ios' ? (
							<Pressable
								onPress={() => setIsDatePickerOpen(false)}
								style={({ pressed }) => [
									styles.doneButton,
									pressed && styles.pressed,
								]}
							>
								<Text style={styles.doneButtonText}>Done</Text>
							</Pressable>
						) : null}
					</Pressable>
				</Pressable>
			</Modal>
		</AuthScreen>
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
	linkButton: {
		alignItems: 'center',
	},
	dateField: {
		gap: 6,
	},
	dateLabel: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 14,
		fontWeight: '600',
	},
	dateButton: {
		height: 50,
		paddingHorizontal: Spacing.medium,
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#D8CEC3',
		borderRadius: 16,
		backgroundColor: 'rgba(255, 255, 255, 0.78)',
	},
	dateText: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 15,
	},
	datePlaceholder: {
		color: Colors.muted,
	},
	pickerBackdrop: {
		flex: 1,
		justifyContent: 'flex-end',
		backgroundColor: 'rgba(43, 33, 27, 0.28)',
	},
	pickerCard: {
		padding: Spacing.large,
		alignItems: 'center',
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		backgroundColor: Colors.background,
	},
	doneButton: {
		minHeight: 46,
		paddingHorizontal: Spacing.xLarge,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 999,
		backgroundColor: Colors.accent,
	},
	doneButtonText: {
		color: Colors.white,
		fontFamily: Fonts.sans,
		fontSize: 15,
		fontWeight: '700',
	},
	pressed: {
		opacity: 0.55,
	},
	mutedLink: {
		color: Colors.muted,
		fontFamily: Fonts.sans,
		fontSize: 14,
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
