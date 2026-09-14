import 'server-only';

import { cache } from 'react';
import { redirect } from 'next/navigation';

import type { TLocale } from '@/i18n/languages';
import { createClient } from '@/lib/supabase/server';
import { isUserRole, type TUserRole } from '../types';

export const getAuthContext = cache(async () => {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return { supabase, user };
});

export async function requireUser(locale: TLocale) {
	const context = await getAuthContext();

	if (!context.user) {
		redirect('/' + locale + '/auth/login');
	}

	return {
		supabase: context.supabase,
		user: context.user,
	};
}

export const getCurrentUserRole = cache(
	async (): Promise<TUserRole | null> => {
		const { supabase, user } = await getAuthContext();

		if (!user) {
			return null;
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', user.id)
			.maybeSingle();

		return isUserRole(profile?.role) ? profile.role : null;
	},
);

export async function requireAdmin(locale: TLocale) {
	const context = await requireUser(locale);
	const role = await getCurrentUserRole();

	if (role !== 'admin') {
		redirect('/' + locale + '/auth/login');
	}

	return {
		...context,
		role,
	};
}
