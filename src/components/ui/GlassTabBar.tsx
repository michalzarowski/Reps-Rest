import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, layout, radii } from '@/theme';

import { Icon, type IconName } from './Icon';

const tabIcons: Record<string, IconName> = {
  index: 'home',
  tools: 'wrench',
  plans: 'clipboardList',
  progress: 'trendingUp',
};

const tabLabels: Record<string, string> = {
  index: 'Główna',
  tools: 'Narzędzia',
  plans: 'Plany',
  progress: 'Postępy',
};

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, layout.tabBarBottomOffset);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: bottom }]}>
      <View style={styles.shell}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={52} tint="dark" style={StyleSheet.absoluteFill} />
        ) : null}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor:
                Platform.OS === 'ios' ? colors.glassFill : colors.androidGlassFill,
            },
          ]}
        />
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const label = tabLabels[route.name] ?? options.title ?? route.name;
            const iconName = tabIcons[route.name] ?? 'home';
            const color = focused ? colors.aqua : colors.textSecondary;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onPress={() => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!focused && !event.defaultPrevented) {
                    navigation.navigate(route.name, route.params);
                  }
                }}
                style={styles.item}
              >
                <View
                  style={[
                    styles.iconWrap,
                    focused && {
                      backgroundColor: colors.activeGlow,
                      borderColor: colors.glassBorder,
                    },
                  ]}
                >
                  <Icon name={iconName} color={color} size="md" />
                </View>
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  shell: {
    height: layout.tabBarHeight,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: colors.glassBorder,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 1,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 6,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
  },
});
