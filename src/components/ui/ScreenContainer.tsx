import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { HeaderShownContext } from '@react-navigation/elements';
import { useContext, type ReactNode } from 'react';
import {
  Platform,
  ScrollView,
  View,
  type RefreshControlProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { layout, spacing } from '@/theme';

import { ScreenHeader } from './ScreenHeader';

interface ScreenContainerProps {
  /** Large in-content title — use on tab roots that hide the native header. */
  title?: string;
  subtitle?: string;
  /** Element rendered to the right of the title (e.g. an IconButton). */
  headerRight?: ReactNode;
  /** Scrollable by default; pass false for fixed layouts. */
  scroll?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * Single screen wrapper used by every route.
 *
 * Insets are derived from the navigation tree instead of hard-coded offsets:
 * - top: safe-area inset only when no native header is shown above the screen;
 * - bottom: inside the tab navigator the tab bar already reserves its space
 *   (and the home-indicator inset), so only regular spacing is added;
 *   outside tabs (profile, plan detail) the safe-area bottom inset is added.
 */
export function ScreenContainer({
  title,
  subtitle,
  headerRight,
  scroll = true,
  refreshControl,
  contentStyle,
  children,
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useContext(BottomTabBarHeightContext);
  const headerShown = useContext(HeaderShownContext);

  const insideTabs = tabBarHeight !== undefined;
  const paddingTop = (headerShown ? 0 : insets.top) + spacing.lg;
  const paddingBottom = (insideTabs ? 0 : insets.bottom) + spacing.xxl;

  const inner = (
    <View
      style={[
        {
          width: '100%',
          maxWidth: layout.maxContentWidth,
          alignSelf: 'center',
          paddingTop,
          paddingBottom,
          paddingLeft: Math.max(layout.screenPadding, insets.left),
          paddingRight: Math.max(layout.screenPadding, insets.right),
          flexGrow: 1,
        },
        contentStyle,
      ]}
    >
      {title ? (
        <ScreenHeader title={title} subtitle={subtitle} right={headerRight} />
      ) : null}
      {children}
    </View>
  );

  if (!scroll) {
    return <View className="flex-1 bg-background">{inner}</View>;
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}
      refreshControl={refreshControl}
    >
      {inner}
    </ScrollView>
  );
}
