import { Platform } from 'react-native';

export const Colors = {
  background: '#F5EFE7',
  foreground: '#2B211B',
  muted: '#6F6258',
  accent: '#4A3224',
  white: '#FFFFFF',
} as const;

export const Fonts = {
  serif: Platform.select({
    ios: 'Georgia',
    android: 'serif',
    default: 'Georgia',
  }),
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
} as const;

export const Spacing = {
  xSmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  xLarge: 32,
} as const;
