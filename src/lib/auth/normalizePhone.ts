export function normalizePhone(phone: string): string {
	const digits = phone.replace(/\D/g, '');

	if (digits.startsWith('9720')) {
		return `972${digits.slice(4)}`;
	}

	if (digits.startsWith('0')) {
		return `972${digits.slice(1)}`;
	}

	return digits;
}
