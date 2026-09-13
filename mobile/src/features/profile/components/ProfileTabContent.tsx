import type { TLocale } from '@/i18n/languages';
import type { TProfileTranslations } from '../profileTranslations';
import type {
	TMobileProfileData,
	TProfileOrderStatus,
	TProfileTab,
} from '../types';
import EmptyProfileState from './EmptyProfileState';
import ProfileDetails from './ProfileDetails';
import ProfileList from './ProfileList';
import ProfileSettings from './ProfileSettings';

type TProfileTabContentProps = {
	activeStatus: TProfileOrderStatus;
	activeTab: TProfileTab;
	copy: TProfileTranslations;
	isEditing: boolean;
	isRtl: boolean;
	locale: TLocale;
	onCancelEdit: () => void;
	onLogout: () => void;
	onLogoutAll: () => Promise<void>;
	onProfileSaved: (profile: TMobileProfileData) => void;
	onStatusChange: (status: TProfileOrderStatus) => void;
	profile: TMobileProfileData;
};

export default function ProfileTabContent({
	activeStatus,
	activeTab,
	copy,
	isEditing,
	isRtl,
	locale,
	onCancelEdit,
	onLogout,
	onLogoutAll,
	onProfileSaved,
	onStatusChange,
	profile,
}: TProfileTabContentProps) {
	if (activeTab === 'profile') {
		return (
			<ProfileDetails
				copy={copy}
				isEditing={isEditing}
				isRtl={isRtl}
				locale={locale}
				onCancelEdit={onCancelEdit}
				onProfileSaved={onProfileSaved}
				profile={profile}
			/>
		);
	}

	if (activeTab === 'bonuses') {
		return (
			<EmptyProfileState
				description={copy.bonusDescription}
				icon='gift'
				isRtl={isRtl}
				title={[copy.bonusText, profile.bonusPoints, copy.bonuses].join(' ')}
			/>
		);
	}

	if (activeTab === 'settings') {
		return (
			<ProfileSettings
				copy={copy}
				isRtl={isRtl}
				locale={locale}
				onLogout={onLogout}
				onLogoutAll={onLogoutAll}
			/>
		);
	}

	return (
		<ProfileList
			activeStatus={activeStatus}
			activeTab={activeTab}
			copy={copy}
			isRtl={isRtl}
			onStatusChange={onStatusChange}
		/>
	);
}
