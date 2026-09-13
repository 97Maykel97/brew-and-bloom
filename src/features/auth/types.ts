export type TUserRole = 'admin' | 'customer';

export function isUserRole(value: unknown): value is TUserRole {
	return value === 'admin' || value === 'customer';
}
