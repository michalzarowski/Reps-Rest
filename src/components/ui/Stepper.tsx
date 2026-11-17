import { Text, View } from 'react-native';

import { IconButton } from './IconButton';

interface StepperProps {
  label: string;
  value: number | string;
  unit?: string;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementDisabled?: boolean;
}

/** Compact −/+ control used for numeric inputs that change in fixed steps. */
export function Stepper({
  label,
  value,
  unit,
  onDecrement,
  onIncrement,
  decrementDisabled,
}: StepperProps) {
  return (
    <View
      className="flex-row items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5"
      accessible={false}
    >
      <View className="flex-1">
        <Text className="text-label text-text-secondary">{label}</Text>
        <Text
          className="text-title text-text-primary"
          style={{ fontVariant: ['tabular-nums'] }}
          accessibilityLiveRegion="polite"
        >
          {value}
          {unit ? <Text className="text-body font-normal text-text-secondary"> {unit}</Text> : null}
        </Text>
      </View>
      <IconButton
        icon="minus"
        accessibilityLabel={`Zmniejsz: ${label}`}
        onPress={onDecrement}
        disabled={decrementDisabled}
      />
      <IconButton
        icon="plus"
        accessibilityLabel={`Zwiększ: ${label}`}
        onPress={onIncrement}
      />
    </View>
  );
}
