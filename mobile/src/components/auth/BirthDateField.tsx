import DateTimePicker from '@react-native-community/datetimepicker';
import { createElement, useState, type ChangeEvent } from 'react';
import {
	Modal,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { TLocale } from '@/i18n/translations';
import {
	formatDateForDisplay,
	formatDateForSupabase,
	getBirthDateBounds,
} from '@/lib/auth/birthDate';

type TBirthDateFieldProps = {
	label: string;
	locale: TLocale;
	value: string;
	onChange: (value: string) => void;
};

type TWebDateInputProps = {
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
}: TWebDateInputProps) {
	return createElement('input', {
		type: 'date',
		'aria-label': label,
		dir: isRtl ? 'rtl' : 'ltr',
		min: minimumDate,
		max: maximumDate,
		value,
		onChange: (event: ChangeEvent<HTMLInputElement>) =>
			onChange(event.target.value),
		style: {
			width: '100%',
			height: 50,
			padding: '0 16px',
			border: '1px solid #D8CEC3',
			borderRadius: 16,
			backgroundColor: 'rgba(255, 255, 255, 0.78)',
			color: '#2B211B',
			fontFamily: 'system-ui',
			fontSize: 15,
			boxSizing: 'border-box',
			textAlign: isRtl ? 'right' : 'left',
		},
	});
}

export default function BirthDateField({
	label,
	locale,
	value,
	onChange,
}: TBirthDateFieldProps) {
	const isRtl = locale === 'he';
	const { minimumDate, maximumDate } = getBirthDateBounds();
	const [selectedDate, setSelectedDate] = useState<Date>(
		new Date(2000, 0, 1),
	);
	const [isDatePickerOpen, setIsDatePickerOpen] =
		useState<boolean>(false);

	function handleDateChange(_: unknown, date?: Date) {
		if (Platform.OS === 'android') {
			setIsDatePickerOpen(false);
		}

		if (date) {
			setSelectedDate(date);
			onChange(formatDateForSupabase(date));
		}
	}

	return (
		<View style={styles.field}>
			<Text style={[styles.label, isRtl && styles.rtlText]}>{label}</Text>

			{Platform.OS === 'web' ? (
				<WebDateInput
					label={label}
					isRtl={isRtl}
					value={value}
					minimumDate={formatDateForSupabase(minimumDate)}
					maximumDate={formatDateForSupabase(maximumDate)}
					onChange={onChange}
				/>
			) : (
				<Pressable
					accessibilityRole='button'
					accessibilityLabel={label}
					onPress={() => setIsDatePickerOpen(true)}
					style={({ pressed }) => [
						styles.dateButton,
						pressed && styles.pressed,
					]}
				>
					<Text
						style={[
							styles.dateText,
							!value && styles.placeholder,
							isRtl && styles.rtlText,
						]}
					>
						{formatDateForDisplay(value, locale) || 'DD.MM.YYYY'}
					</Text>
				</Pressable>
			)}

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
							minimumDate={minimumDate}
							maximumDate={maximumDate}
							themeVariant='light'
							textColor={Colors.foreground}
							accentColor={Colors.accent}
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
	placeholder: {
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
	rtlText: {
		writingDirection: 'rtl',
		textAlign: 'right',
	},
});
