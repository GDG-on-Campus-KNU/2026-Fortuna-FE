/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Palette = {
  // Brand Blue
  primary: '#1E6AF4',
  primaryDark: '#0C46B4',
  primaryLight: '#EBF2FE',
  primaryHover: 'rgba(30, 106, 244, 0.08)',
  primaryMuted: 'rgba(30, 106, 244, 0.03)',
  primarySubtle: 'rgba(30, 106, 244, 0.01)',
  primaryBorder: 'rgba(30, 106, 244, 0.12)',
  primaryFill: 'rgba(30, 106, 244, 0.06)',
  primaryDisabled: 'rgba(30, 106, 244, 0.15)',

  // Neutrals / Typography
  textPrimary: '#100C08',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textPlaceholder: 'rgba(16, 12, 8, 0.3)',
  textOpMuted: 'rgba(16, 12, 8, 0.5)',
  textDarkSlate: '#0F172A',
  textErrorSlate: '#1E293B',

  // Backgrounds & Containers
  bgPage: '#FDFDFD',
  bgCard: '#FFFFFF',
  bgControl: 'rgba(16, 12, 8, 0.08)',
  bgAlt: '#F1F5F9',

  // Borders & Dividers
  border: '#E2E8F0',
  borderDark: 'rgba(16, 12, 8, 0.1)',
  borderLight: '#F8FAFC',
  borderMedium: '#D1D5DB',
  borderSeparator: 'rgba(16, 12, 8, 0.15)',

  // Feedback
  success: '#10B981',
  error: '#EF4444',
  errorDark: '#DC2626',
  warning: '#F59E0B',
  warningDark: '#D97706',
  disabled: '#CBD5E1',

  // Formats (HomeScreen details)
  formatDialog: '#3B82F6',
  formatDialogBg: '#EFF6FF',
  formatQuiz: '#10B981',
  formatQuizBg: '#ECFDF5',
  formatStory: '#8B5CF6',
  formatStoryBg: '#F5F3FF',
  formatOther: '#6B7280',
  formatOtherBg: '#F3F4F6',

  // Overlays & Shadows
  overlay: 'rgba(0, 0, 0, 0.4)',
  shadow: '#000000',
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
    googleSansFlexThin: 'GoogleSansFlex-100',
    googleSansFlexExtraLight: 'GoogleSansFlex-200',
    googleSansFlexLight: 'GoogleSansFlex-300',
    googleSansFlexRegular: 'GoogleSansFlex-400',
    googleSansFlexMedium: 'GoogleSansFlex-500',
    googleSansFlexSemiBold: 'GoogleSansFlex-600',
    googleSansFlexBold: 'GoogleSansFlex-700',
    googleSansFlexExtraBold: 'GoogleSansFlex-800',
    googleSansFlexBlack: 'GoogleSansFlex-900',
    pretendard: 'Pretendard-Regular',
    pretendardThin: 'Pretendard-Thin',
    pretendardExtraLight: 'Pretendard-ExtraLight',
    pretendardLight: 'Pretendard-Light',
    pretendardRegular: 'Pretendard-Regular',
    pretendardMedium: 'Pretendard-Medium',
    pretendardSemiBold: 'Pretendard-SemiBold',
    pretendardBold: 'Pretendard-Bold',
    pretendardExtraBold: 'Pretendard-ExtraBold',
    pretendardBlack: 'Pretendard-Black',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
    googleSansFlexThin: 'GoogleSansFlex-100',
    googleSansFlexExtraLight: 'GoogleSansFlex-200',
    googleSansFlexLight: 'GoogleSansFlex-300',
    googleSansFlexRegular: 'GoogleSansFlex-400',
    googleSansFlexMedium: 'GoogleSansFlex-500',
    googleSansFlexSemiBold: 'GoogleSansFlex-600',
    googleSansFlexBold: 'GoogleSansFlex-700',
    googleSansFlexExtraBold: 'GoogleSansFlex-800',
    googleSansFlexBlack: 'GoogleSansFlex-900',
    pretendard: 'Pretendard-Regular',
    pretendardThin: 'Pretendard-Thin',
    pretendardExtraLight: 'Pretendard-ExtraLight',
    pretendardLight: 'Pretendard-Light',
    pretendardRegular: 'Pretendard-Regular',
    pretendardMedium: 'Pretendard-Medium',
    pretendardSemiBold: 'Pretendard-SemiBold',
    pretendardBold: 'Pretendard-Bold',
    pretendardExtraBold: 'Pretendard-ExtraBold',
    pretendardBlack: 'Pretendard-Black',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    googleSansFlexThin:
      "GoogleSansFlex-100, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    googleSansFlexExtraLight:
      "GoogleSansFlex-200, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    googleSansFlexLight:
      "GoogleSansFlex-300, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    googleSansFlexRegular:
      "GoogleSansFlex-400, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    googleSansFlexMedium:
      "GoogleSansFlex-500, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    googleSansFlexSemiBold:
      "GoogleSansFlex-600, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    googleSansFlexBold:
      "GoogleSansFlex-700, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    googleSansFlexExtraBold:
      "GoogleSansFlex-800, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    googleSansFlexBlack:
      "GoogleSansFlex-900, 'Google Sans Flex', -apple-system, BlinkMacSystemFont, sans-serif",
    pretendard:
      "Pretendard-Regular, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardThin:
      "Pretendard-Thin, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardExtraLight:
      "Pretendard-ExtraLight, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardLight:
      "Pretendard-Light, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardRegular:
      "Pretendard-Regular, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardMedium:
      "Pretendard-Medium, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardSemiBold:
      "Pretendard-SemiBold, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardBold:
      "Pretendard-Bold, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardExtraBold:
      "Pretendard-ExtraBold, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    pretendardBlack:
      "Pretendard-Black, Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
});
