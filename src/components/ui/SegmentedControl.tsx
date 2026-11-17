import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/context';
import { radii } from '@/theme';

import { GlassSurface } from './GlassSurface';

interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

/** Equal-width segmented switch for 2–4 mutually exclusive options. */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { colors, glass } = useTheme();
  return (
    <GlassSurface radius={radii.md} intensity="subtle" contentClassName="p-1">
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        className="flex-row"
      >
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={String(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              onPress={() => onChange(option.value)}
              className={`min-h-[40px] flex-1 ${selected ? '' : 'active:opacity-60'}`}
            >
              {selected ? (
                <View
                  style={{
                    flex: 1,
                    borderRadius: radii.sm,
                    shadowColor: glass.glow,
                    shadowOpacity: 0.45,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 0 },
                  }}
                >
                  <LinearGradient
                    colors={[colors.accentHighlight, colors.accent]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      flex: 1,
                      minHeight: 40,
                      borderRadius: radii.sm,
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingHorizontal: 8,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.3)',
                    }}
                  >
                    <Text numberOfLines={1} className="text-label font-semibold text-on-accent">
                      {option.label}
                    </Text>
                  </LinearGradient>
                </View>
              ) : (
                <View className="min-h-[40px] flex-1 items-center justify-center px-2">
                  <Text numberOfLines={1} className="text-label font-semibold text-text-secondary">
                    {option.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </GlassSurface>
  );
}
