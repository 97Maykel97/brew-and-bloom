import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

export async function registerCurrentMobileDevice(): Promise<void> {
	const brand = Device.brand?.trim() || '';
	const modelName = Device.modelName?.trim() || '';
	const deviceName =
		modelName && brand && !modelName.toLowerCase().includes(brand.toLowerCase())
			? brand + ' ' + modelName
			: modelName || brand || 'Mobile device';
	const platform = [
		Device.osName?.trim() || Platform.OS,
		Device.osVersion?.trim() || '',
	]
		.filter(Boolean)
		.join(' ');

	try {
		await supabase.rpc('register_current_session_device', {
			p_device_name: deviceName,
			p_platform: platform,
			p_client_kind: 'mobile_app',
		});
	} catch {
		// Device registration must never block a successful sign-in.
	}
}
