import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AuthField from '@/components/auth/AuthField';
import AuthMessage from '@/components/auth/AuthMessage';
import AuthSubmitButton from '@/components/auth/AuthSubmitButton';
import BirthDateField from '@/components/auth/BirthDateField';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { isValidBirthDate } from '@/lib/auth/birthDate';
import { normalizePhone } from '@/lib/auth/normalizePhone';
import { formatPhoneInput } from '@/lib/auth/phoneMask';
import { supabase } from '@/lib/supabase';
import type { TLocale } from '@/i18n/translations';
import {
	formatBirthDate,
	formatPhoneNumber,
} from '../lib/profile-formatters';
import type { TMobileProfileData } from '../types';
import type { TProfileTranslations } from '../profileTranslations';

type TProfileEditFormProps = {
	copy: TProfileTranslations;
	locale: TLocale;
	profile: TMobileProfileData;
	onCancel: () => void;
	onSaved: (profile: TMobileProfileData) => void;
};

export default function ProfileEditForm({
	copy,
	locale,
	profile,
	onCancel,
	onSaved,
}: TProfileEditFormProps) {
	const isRtl = locale === 'he';
	const [firstName, setFirstName] = useState(profile.firstName);
	const [lastName, setLastName] = useState(profile.lastName);
	const [phone, setPhone] = useState(formatPhoneInput(profile.phone));
	const [birthDate, setBirthDate] = useState(profile.birthDateValue);
	const [message, setMessage] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	async function handleSave() {
		setMessage('');
		const normalizedFirstName = firstName.trim();
		const normalizedLastName = lastName.trim();
		const normalizedPhone = normalizePhone(phone);

		if (
			!normalizedFirstName ||
			!normalizedLastName ||
			!normalizedPhone ||
			!birthDate
		) {
			setMessage(copy.requiredProfileFields);
			return;
		}

		if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
			setMessage(copy.invalidPhone);
			return;
		}

		if (!isValidBirthDate(birthDate)) {
			setMessage(copy.profileUpdateError);
			return;
		}

		setIsSaving(true);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				setMessage(copy.profileUpdateError);
				return;
			}

			const displayName = `${normalizedFirstName} ${normalizedLastName}`;
			const { error } = await supabase
				.from('profiles')
				.update({
					first_name: normalizedFirstName,
					last_name: normalizedLastName,
					phone: normalizedPhone,
					birth_date: birthDate,
				})
				.eq('id', user.id);

			if (error) {
				setMessage(
					error.code === '23505'
						? copy.phoneAlreadyExists
						: copy.profileUpdateError,
				);
				return;
			}

			await supabase.auth.updateUser({
				data: {
					first_name: normalizedFirstName,
					last_name: normalizedLastName,
					full_name: displayName,
					display_name: displayName,
					phone: normalizedPhone,
					birth_date: birthDate,
				},
			});

			onSaved({
				birthDate: formatBirthDate(birthDate, locale),
				birthDateValue: birthDate,
				bonusPoints: profile.bonusPoints,
				displayName,
				email: profile.email,
				firstName: normalizedFirstName,
				lastName: normalizedLastName,
				phone: formatPhoneNumber(normalizedPhone),
			});
		} catch {
			setMessage(copy.profileUpdateError);
		} finally {
			setIsSaving(false);
		}
	}

	return (
		<View style={styles.form}>
			<Text style={[styles.title, isRtl && styles.rtlText]}>
				{copy.editingProfile}
			</Text>
			<AuthField
				label={copy.firstName}
				isRtl={isRtl}
				value={firstName}
				onChangeText={setFirstName}
			/>
			<AuthField
				label={copy.lastName}
				isRtl={isRtl}
				value={lastName}
				onChangeText={setLastName}
			/>
			<BirthDateField
				label={copy.birthDate}
				locale={locale}
				value={birthDate}
				onChange={setBirthDate}
			/>
			<AuthField
				label={copy.phone}
				isRtl={isRtl}
				keyboardType='phone-pad'
				autoComplete='tel'
				maxLength={17}
				placeholder='+972 50-123-4567'
				returnKeyType='done'
				value={phone}
				onChangeText={value => setPhone(formatPhoneInput(value))}
			/>

			{message ? <AuthMessage isRtl={isRtl}>{message}</AuthMessage> : null}

			<AuthSubmitButton
				label={copy.save}
				loadingLabel={copy.saving}
				isLoading={isSaving}
				onPress={handleSave}
			/>
			<Pressable
				accessibilityRole='button'
				disabled={isSaving}
				onPress={onCancel}
				style={({ pressed }) => [
					styles.cancelButton,
					pressed && styles.pressed,
				]}
			>
				<Text style={styles.cancelText}>{copy.cancel}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	form: {
		marginTop: Spacing.medium,
		gap: Spacing.medium,
	},
	title: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 18,
		fontWeight: '700',
	},
	cancelButton: {
		minHeight: 46,
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderColor: '#D8CEC3',
		borderRadius: 999,
	},
	cancelText: {
		color: Colors.foreground,
		fontFamily: Fonts.sans,
		fontSize: 15,
		fontWeight: '600',
	},
	pressed: {
		opacity: 0.65,
	},
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
