export function isValidBirthDate(value: string): boolean {
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
