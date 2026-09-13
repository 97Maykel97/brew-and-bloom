import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
} from 'react-native';

import type { TLocale } from '@/i18n/languages';
import ProfileBonusCard from './components/ProfileBonusCard';
import ProfileGreeting from './components/ProfileGreeting';
import ProfileTabContent from './components/ProfileTabContent';
import ProfileTabs from './components/ProfileTabs';
import { profileContentStyles as styles } from './components/profile-content.styles';
import { profileTranslations } from './profileTranslations';
import type {
	TMobileProfileData,
	TProfileOrderStatus,
	TProfileTab,
} from './types';

type TProfileContentProps = {
	activeStatus: TProfileOrderStatus;
	activeTab: TProfileTab;
	locale: TLocale;
	isEditing: boolean;
	onEdit: () => void;
	onCancelEdit: () => void;
	onProfileSaved: (profile: TMobileProfileData) => void;
	onLogout: () => void;
	onLogoutAll: () => Promise<void>;
	onStatusChange: (status: TProfileOrderStatus) => void;
	onTabChange: (tab: TProfileTab) => void;
	profile: TMobileProfileData;
};

export default function ProfileContent({
	activeStatus,
	activeTab,
	locale,
	isEditing,
	onEdit,
	onCancelEdit,
	onProfileSaved,
	onLogout,
	onLogoutAll,
	onStatusChange,
	onTabChange,
	profile,
}: TProfileContentProps) {
	const copy = profileTranslations[locale];
	const isRtl = locale === 'he';

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			style={styles.keyboardAvoiding}
		>
			<ScrollView
				automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
				contentContainerStyle={styles.content}
				contentInsetAdjustmentBehavior='automatic'
				keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
				keyboardShouldPersistTaps='handled'
				showsVerticalScrollIndicator={false}
			>
				<ProfileGreeting
					copy={copy}
					isRtl={isRtl}
					onEdit={onEdit}
					profile={profile}
					showEdit={activeTab === 'profile'}
				/>
				<ProfileBonusCard
					bonusPoints={profile.bonusPoints}
					copy={copy}
					isRtl={isRtl}
					onPress={() => onTabChange('bonuses')}
				/>
				<ProfileTabs
					activeTab={activeTab}
					copy={copy}
					isRtl={isRtl}
					onTabChange={onTabChange}
				/>
				<ProfileTabContent
					activeStatus={activeStatus}
					activeTab={activeTab}
					copy={copy}
					isEditing={isEditing}
					isRtl={isRtl}
					locale={locale}
					onCancelEdit={onCancelEdit}
					onLogout={onLogout}
					onLogoutAll={onLogoutAll}
					onProfileSaved={onProfileSaved}
					onStatusChange={onStatusChange}
					profile={profile}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}
