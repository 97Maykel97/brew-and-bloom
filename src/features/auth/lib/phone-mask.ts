const ISRAEL_COUNTRY_CODE = '972';
const MAX_LOCAL_PHONE_LENGTH = 9;

export function formatPhoneInput(value: string): string {
	const digits = value.replace(/\D/g, '');

	if (!digits) {
		return '';
	}

	if (digits === '0') {
		return '0';
	}

	if (digits === ISRAEL_COUNTRY_CODE && value.trim().startsWith('+')) {
		return '';
	}

	const localDigits = getLocalDigits(digits).slice(
		0,
		MAX_LOCAL_PHONE_LENGTH,
	);
	let formattedPhone = '+972';

	if (localDigits.length > 0) {
		formattedPhone += ' ' + localDigits.slice(0, 2);
	}

	if (localDigits.length > 2) {
		formattedPhone += '-' + localDigits.slice(2, 5);
	}

	if (localDigits.length > 5) {
		formattedPhone += '-' + localDigits.slice(5, 9);
	}

	return formattedPhone;
}

function getLocalDigits(digits: string): string {
	if (digits.startsWith(ISRAEL_COUNTRY_CODE)) {
		return digits.slice(ISRAEL_COUNTRY_CODE.length).replace(/^0/, '');
	}

	return digits.replace(/^0/, '');
}
