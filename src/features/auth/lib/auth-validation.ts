export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function normalizeEmail(email: string): string {
	return email.trim();
}

export function isValidEmail(email: string): boolean {
	return EMAIL_PATTERN.test(email);
}

export function isPasswordLongEnough(password: string): boolean {
	return password.length >= MIN_PASSWORD_LENGTH;
}

export function doPasswordsMatch(
	password: string,
	confirmation: string,
): boolean {
	return password === confirmation;
}
