import { CalendarDays, Heart } from 'lucide-react';
import type { TProfileCopy } from '../profile-copy';
import type {
	TOrderStatus,
	TProfileLocale,
	TProfileTab,
	TProfileViewModel,
} from '../types';
import BonusView from './BonusView';
import EmptyState from './EmptyState';
import OrdersView from './OrdersView';
import ProfileDetails from './ProfileDetails';
import SettingsView from './SettingsView';

type TProfileContentProps = {
	locale: TProfileLocale;
	activeTab: TProfileTab;
	activeOrderStatus: TOrderStatus;
	copy: TProfileCopy;
	isEditing: boolean;
	onOrderStatusChange: (status: TOrderStatus) => void;
	onCancelEdit: () => void;
	onProfileSaved: (profile: TProfileViewModel) => void;
	onOpenSettings: () => void;
	openChangePassword: boolean;
	profile: TProfileViewModel;
};

export default function ProfileContent({
	locale,
	activeTab,
	activeOrderStatus,
	copy,
	isEditing,
	onOrderStatusChange,
	onCancelEdit,
	onProfileSaved,
	onOpenSettings,
	openChangePassword,
	profile,
}: TProfileContentProps) {
	if (activeTab === 'orders') {
		return (
			<OrdersView
				locale={locale}
				activeStatus={activeOrderStatus}
				copy={copy}
				onStatusChange={onOrderStatusChange}
			/>
		);
	}

	if (activeTab === 'favorites') {
		return (
			<EmptyState
				id='favorites'
				icon={<Heart size={24} strokeWidth={1.6} />}
				title={copy.emptyFavorites}
				description={copy.emptyFavoritesText}
				actionLabel={copy.explore}
				actionHref={'/' + locale + '/menu'}
			/>
		);
	}

	if (activeTab === 'bookings') {
		return (
			<EmptyState
				id='bookings'
				icon={<CalendarDays size={24} strokeWidth={1.6} />}
				title={copy.emptyBookings}
				description={copy.emptyBookingsText}
				actionLabel={copy.makeBooking}
				actionHref={'/' + locale}
			/>
		);
	}

	if (activeTab === 'bonuses') {
		return <BonusView copy={copy} profile={profile} />;
	}

	if (activeTab === 'settings') {
		return (
			<SettingsView
				copy={copy}
				locale={locale}
				openChangePassword={openChangePassword}
			/>
		);
	}

	return (
		<ProfileDetails
			copy={copy}
			locale={locale}
			isEditing={isEditing}
			profile={profile}
			onCancelEdit={onCancelEdit}
			onProfileSaved={onProfileSaved}
			onOpenSettings={onOpenSettings}
		/>
	);
}
