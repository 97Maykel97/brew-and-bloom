import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
	process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
	throw new Error(
		'Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
	);
}

async function getSecureItem(key: string) {
	try {
		return await SecureStore.getItemAsync(key);
	} catch {
		return null;
	}
}

const secureStorage = {
	getItem: getSecureItem,
	setItem: (key: string, value: string) =>
		SecureStore.setItemAsync(key, value),
	removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const webStorage = {
	getItem: async (key: string) =>
		typeof localStorage === 'undefined' ? null : localStorage.getItem(key),
	setItem: async (key: string, value: string) => {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(key, value);
		}
	},
	removeItem: async (key: string) => {
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(key);
		}
	},
};

export const supabase = createClient(
	supabaseUrl,
	supabasePublishableKey,
	{
		auth: {
			storage: Platform.OS === 'web' ? webStorage : secureStorage,
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
		},
	},
);
