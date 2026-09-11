import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

import brandLogo from '../../assets/images/brand-logo.png';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import type { Locale } from '@/i18n/translations';

type HeaderProps = {
  locale: Locale;
  navItems: string[];
  searchPlaceholder: string;
  onLocaleChange: (locale: Locale) => void;
};

const languageOptions: {
  locale: Locale;
  label: string;
  name: string;
}[] = [
  { locale: 'ru', label: 'RU', name: 'Русский' },
  { locale: 'en', label: 'EN', name: 'English' },
  { locale: 'he', label: 'HE', name: 'עברית' },
];

export default function Header({
  locale,
  navItems,
  searchPlaceholder,
  onLocaleChange,
}: HeaderProps) {
  const { height } = useWindowDimensions();
  const isRtl = locale === 'he';
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');

  function toggleMenu() {
    setIsMenuOpen((value) => !value);
    setIsSearchOpen(false);
    setIsLanguageOpen(false);
  }

  function toggleSearch() {
    if (isSearchOpen) {
      closeSearch();
      return;
    }

    setIsSearchOpen(true);
    setIsMenuOpen(false);
    setIsLanguageOpen(false);
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function closeSearch() {
    setIsSearchOpen(false);
    Keyboard.dismiss();
  }

  function toggleLanguage() {
    setIsLanguageOpen((value) => !value);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }

  function closeLanguage() {
    setIsLanguageOpen(false);
  }

  function selectLanguage(nextLocale: Locale) {
    onLocaleChange(nextLocale);
    closeLanguage();
  }

  function handleSearchAction() {
    if (query.length > 0) {
      setQuery('');
      return;
    }

    closeSearch();
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          accessibilityRole="button"
          accessibilityState={{ expanded: isMenuOpen }}
          onPress={toggleMenu}
          style={styles.menuButton}
        >
          <Feather
            name={isMenuOpen ? 'x' : 'menu'}
            size={24}
            color={Colors.foreground}
          />
        </Pressable>

        <View style={styles.logoWrapper}>
          <Image
            source={brandLogo}
            contentFit="contain"
            style={styles.logo}
            alt="Brew & Bloom"
          />
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityLabel="Поиск"
            accessibilityRole="button"
            accessibilityState={{ expanded: isSearchOpen }}
            onPress={toggleSearch}
            style={styles.iconButton}
          >
            <Feather name="search" size={20} color={Colors.foreground} />
          </Pressable>

          <Pressable
            accessibilityLabel="Избранное"
            accessibilityRole="button"
            style={styles.iconButton}
          >
            <Feather name="heart" size={20} color={Colors.foreground} />
          </Pressable>

          <Pressable
            accessibilityLabel="Профиль"
            accessibilityRole="button"
            style={styles.iconButton}
          >
            <Feather name="user" size={20} color={Colors.foreground} />
          </Pressable>

          <Pressable
            accessibilityLabel="Переключить язык"
            accessibilityRole="button"
            accessibilityState={{ expanded: isLanguageOpen }}
            onPress={toggleLanguage}
            style={styles.languageButton}
          >
            <Text style={styles.language}>
              {locale.toUpperCase()}
            </Text>
          </Pressable>
        </View>
      </View>

      {isLanguageOpen && (
        <Modal
          animationType='fade'
          onRequestClose={closeLanguage}
          transparent
          visible={isLanguageOpen}
        >
          <Pressable style={styles.languageOverlay} onPress={closeLanguage}>
            <Pressable
              style={styles.languageMenu}
              onPress={event => event.stopPropagation()}
            >
              {languageOptions
                .filter(option => option.locale !== locale)
                .map(option => (
                  <Pressable
                    accessibilityRole='button'
                    key={option.locale}
                    onPress={() => selectLanguage(option.locale)}
                    style={({ pressed }) => [
                      styles.languageOption,
                      pressed && styles.menuItemPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.languageOptionText,
                        option.locale === 'he' && styles.rtlText,
                      ]}
                    >
                      {option.label} · {option.name}
                    </Text>
                  </Pressable>
                ))}
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {isSearchOpen && (
        <Modal
          animationType="fade"
          onRequestClose={closeSearch}
          transparent
          visible={isSearchOpen}
        >
          <Pressable style={styles.searchOverlay} onPress={closeSearch}>
            <Pressable
              style={styles.searchBar}
              onPress={(event) => event.stopPropagation()}
            >
              <Feather name="search" size={19} color={Colors.muted} />

              <TextInput
                autoFocus
                accessibilityLabel="Поиск"
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={Colors.muted}
                style={[styles.searchInput, isRtl && styles.rtlText]}
                value={query}
              />

              <Pressable
                accessibilityLabel="Очистить поиск"
                accessibilityRole="button"
                onPress={handleSearchAction}
                style={styles.clearButton}
              >
                <Feather name="x" size={18} color={Colors.foreground} />
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {isMenuOpen && (
        <View
          style={[
            styles.menuLayer,
            { height: Math.max(height - styles.header.minHeight, 0) },
          ]}
        >
          <Pressable
            accessibilityLabel="Закрыть меню"
            accessibilityRole="button"
            onPress={closeMenu}
            style={styles.menuBackdrop}
          />

          <View style={styles.menu}>
            <ScrollView
              contentContainerStyle={styles.menuContent}
              showsVerticalScrollIndicator={false}
            >
              {navItems.map((item) => (
                <Pressable
                  accessibilityRole="link"
                  key={item}
                  onPress={closeMenu}
                  style={({ pressed }) => [
                    styles.menuItem,
                    pressed && styles.menuItemPressed,
                  ]}
                >
                  <Text style={[styles.menuText, isRtl && styles.rtlText]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 10,
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 48,
  },
  actions: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  language: {
    color: Colors.foreground,
    fontFamily: Fonts.sans,
    fontSize: 13,
    textAlign: 'right',
  },
  languageButton: {
    width: 36,
    height: 40,
    marginRight: Spacing.small,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  languageOverlay: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: Spacing.large,
  },
  languageMenu: {
    minWidth: 168,
    padding: Spacing.small,
    borderRadius: 12,
    backgroundColor: Colors.background,
    shadowColor: Colors.foreground,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 6,
  },
  languageOption: {
    minHeight: 44,
    paddingHorizontal: Spacing.small,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  languageOptionText: {
    color: Colors.foreground,
    fontFamily: Fonts.sans,
    fontSize: 14,
  },
  searchBar: {
    minHeight: 52,
    paddingHorizontal: Spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.small,
    borderRadius: 12,
    backgroundColor: Colors.background,
    shadowColor: Colors.foreground,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  searchOverlay: {
    flex: 1,
    paddingTop: 84,
    paddingHorizontal: Spacing.medium,
    backgroundColor: 'rgba(43, 33, 27, 0.18)',
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    color: Colors.foreground,
    fontFamily: Fonts.sans,
    fontSize: 15,
  },
  rtlText: {
    writingDirection: 'rtl',
  },
  clearButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menu: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    maxHeight: 420,
    backgroundColor: Colors.background,
    shadowColor: Colors.foreground,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.14,
    shadowRadius: 12,
    elevation: 8,
  },
  menuLayer: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(43, 33, 27, 0.16)',
  },
  menuContent: {
    paddingHorizontal: Spacing.large,
    paddingVertical: Spacing.medium,
    gap: Spacing.small,
  },
  menuItem: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8CEC3',
  },
  menuItemPressed: {
    opacity: 0.55,
  },
  menuText: {
    color: Colors.foreground,
    fontFamily: Fonts.serif,
    fontSize: 24,
  },
});
