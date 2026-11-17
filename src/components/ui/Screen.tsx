import type { ReactNode } from 'react';
import { ScrollView, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { layout } from '@/theme';

import { LiquidBackground } from './LiquidBackground';

interface ScreenProps extends ViewProps {
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  /** Extra bottom padding for floating tab bar (default true). */
  tabBarInset?: boolean;
  children?: ReactNode;
}

export function Screen({
  title,
  subtitle,
  scroll = true,
  tabBarInset = true,
  children,
  className,
  ...rest
}: ScreenProps) {
  const bottomPad = tabBarInset ? layout.screenBottomInset : layout.tabBarBottomOffset;

  const body = (
    <View className="flex-1 px-5 pt-2" style={{ paddingBottom: bottomPad }} {...rest}>
      {title ? (
        <Text className="text-hero text-text-primary">{title}</Text>
      ) : null}
      {subtitle ? (
        <Text className="mt-2 text-body text-text-secondary">{subtitle}</Text>
      ) : null}
      <View className={`mt-5 flex-1 ${className ?? ''}`}>{children}</View>
    </View>
  );

  return (
    <LiquidBackground>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            contentContainerClassName="grow"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {body}
          </ScrollView>
        ) : (
          body
        )}
      </SafeAreaView>
    </LiquidBackground>
  );
}
