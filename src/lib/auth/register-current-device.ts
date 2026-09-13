import { getWebDeviceRegistration } from '@/features/profile/lib/session-formatters';
import { createClient } from '@/lib/supabase/client';

export async function registerCurrentWebDevice(): Promise<void> {
	if (typeof navigator === 'undefined') return;

	const device = getWebDeviceRegistration(navigator.userAgent);
	const supabase = createClient();

	try {
		await supabase.rpc('register_current_session_device', {
			p_device_name: device.deviceName,
			p_platform: device.platform,
			p_client_kind: 'browser',
		});
	} catch {
		// Device registration must never block a successful sign-in.
	}
}
