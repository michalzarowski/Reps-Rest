import { router } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';

import { contentGlow, GlassSurface, Icon, SectionHeader } from '@/components';
import { useTheme } from '@/context';
import { TOOL_CATALOG } from '@/features/tools';

/** Poniżej tej szerokości cztery kafelki w rzędzie są za wąskie na etykiety. */
const TWO_COLUMN_BREAKPOINT = 360;

export function QuickTools() {
  const { colors, glass } = useTheme();
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
            >
              {({ pressed }) => (
                <GlassSurface
                  pressed={pressed}
                  contentClassName="min-h-[84px] items-center justify-center gap-2 px-1 py-3"
                >
                  <View
                    style={contentGlow(glass.glow, 8)}
                  >
                    <Icon name={tool.icon} color={colors.accent} />
                  </View>
                  <Text
                    className="text-body font-medium text-text-primary"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.85}
                  >
                    {tool.shortLabel}
                  </Text>
                </GlassSurface>
              )}
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
