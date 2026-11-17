import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { colors, motion } from '@/theme';

import { GlassPanel } from './GlassPanel';
import { Icon, type IconName } from './Icon';

interface ModuleTileProps {
  href: string;
  title: string;
  description: string;
  icon: IconName;
  variant?: 'soft' | 'elevated';
  showChevron?: boolean;
}

export function ModuleTile({
  href,
  title,
  description,
  icon,
  variant = 'soft',
  showChevron = true,
}: ModuleTileProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Link href={href as Href} asChild>
      <Pressable
        onPressIn={() => {
          scale.value = withTiming(motion.pressScale, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
      >
        <Animated.View style={animatedStyle}>
          <GlassPanel variant={variant}>
            <View className="flex-row items-center gap-3">
              <View
                className="rounded-md p-3"
                style={{ backgroundColor: colors.activeGlow }}
              >
                <Icon name={icon} color={colors.aqua} size="lg" />
              </View>
              <View className="flex-1">
                <Text className="text-body font-semibold text-text-primary">
                  {title}
                </Text>
                <Text className="mt-1 text-caption text-text-secondary">
                  {description}
                </Text>
              </View>
              {showChevron ? (
                <Icon name="chevronRight" color={colors.textMuted} size="sm" />
              ) : null}
            </View>
          </GlassPanel>
        </Animated.View>
      </Pressable>
    </Link>
  );
}
