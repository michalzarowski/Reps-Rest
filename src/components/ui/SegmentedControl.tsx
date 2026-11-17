import { Pressable, Text, View } from 'react-native';

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
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      className="flex-row rounded-md border border-border bg-surface p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected, checked: selected }}
            onPress={() => onChange(option.value)}
            className={`min-h-[40px] flex-1 items-center justify-center rounded-sm px-2 ${
              selected ? 'bg-accent' : 'active:opacity-60'
            }`}
          >
            <Text
              numberOfLines={1}
              className={`text-label font-semibold ${
                selected ? 'text-on-accent' : 'text-text-secondary'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
