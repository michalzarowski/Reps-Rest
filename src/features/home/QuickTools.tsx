import { router } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { Icon, SectionHeader } from '@/components';
import { useTheme } from '@/context';
import { TOOL_CATALOG } from '@/features/tools';

/** Below this width four tiles in a row get too narrow for labels. */
const TWO_COLUMN_BREAKPOINT = 360;

export function QuickTools() {
  const { colors } = useTheme();
  const { width, fontScale } = useWindowDimensions();
  const twoColumns = width < TWO_COLUMN_BREAKPOINT || fontScale > 1.3;

  return (
    <View>
      <SectionHeader title="Szybkie narzędzia" />
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
        {TOOL_CATALOG.map((tool) => (
          <View
            key={tool.title}
            style={{ width: twoColumns ? '50%' : '25%', padding: 5 }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tool.title}
              onPress={() => router.push(tool.href)}
              className="min-h-[84px] items-center justify-center gap-2 rounded-lg border border-border bg-surface px-1 py-3 active:bg-surface-elevated"
            >
              <Icon name={tool.icon} color={colors.accent} />
              <Text
                className="text-body font-medium text-text-primary"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {tool.shortLabel}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
