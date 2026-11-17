import { Text, View } from 'react-native';

import { useTheme } from '@/context';

import { Button } from './Button';
import { Icon } from './Icon';

interface ErrorStateProps {
  message: string;
  /** Extra lines (e.g. remaining validation errors). */
  details?: string[];
  actionLabel?: string;
  onActionPress?: () => void;
}

/** Inline error banner with an optional recovery action. */
export function ErrorState({ message, details, actionLabel, onActionPress }: ErrorStateProps) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      className="rounded-md border border-danger/40 bg-danger/10 p-3"
    >
      <View className="flex-row items-start gap-2.5">
        <Icon name="alert" size="sm" color={colors.danger} />
        <View className="flex-1">
          <Text className="text-body font-medium text-danger">{message}</Text>
          {details?.map((line) => (
            <Text key={line} className="mt-1 text-label text-text-secondary">
              {line}
            </Text>
          ))}
        </View>
      </View>
      {actionLabel && onActionPress ? (
        <View className="mt-3">
          <Button label={actionLabel} variant="secondary" size="sm" onPress={onActionPress} />
        </View>
      ) : null}
    </View>
  );
}
