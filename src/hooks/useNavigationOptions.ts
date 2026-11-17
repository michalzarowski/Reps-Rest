import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassTabBarBackground } from '@/components';
import { useTheme } from '@/context';
import { typography } from '@/theme';

/** Shared header look for every stack (root, tools, records). */
export function useStackScreenOptions(): NativeStackNavigationOptions {
  const { colors } = useTheme();
  return useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.background },
      headerTintColor: colors.accent,
      headerTitleStyle: {
        color: colors.textPrimary,
        fontSize: typography.cardTitle,
        fontWeight: '600',
      },
      headerShadowVisible: false,
      headerBackButtonDisplayMode: 'minimal',
      contentStyle: { backgroundColor: colors.background },
    }),
    [colors],
  );
}

/** Visible tab bar height above the home indicator (icon + label + padding). */
const TAB_BAR_CONTENT_HEIGHT = 56;

/**
 * Standard (non-floating) bottom tab bar. The navigator lays it out below the
 * scene, so screens never need a manual bottom offset; the home indicator
 * inset is added by React Navigation.
 */
export function useTabScreenOptions(): BottomTabNavigationOptions {
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  return useMemo(
    () => ({
      headerShown: false,
      sceneStyle: { backgroundColor: colors.background },
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarHideOnKeyboard: Platform.OS === 'android',
      tabBarStyle: {
        backgroundColor: colors.background,
        borderTopWidth: 0,
        // A custom height replaces the default, so the home-indicator inset is
        // added back explicitly (React Navigation pads the bottom by it).
        height: TAB_BAR_CONTENT_HEIGHT + bottom,
        elevation: 0,
        shadowOpacity: 0,
      },
      tabBarBackground: GlassTabBarBackground,
      tabBarLabelStyle: {
        fontSize: 11,
        lineHeight: 14,
        fontWeight: '600',
      },
      tabBarAllowFontScaling: true,
    }),
    [colors, bottom],
  );
}
