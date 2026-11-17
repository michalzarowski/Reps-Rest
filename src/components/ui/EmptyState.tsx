import { Text, View } from 'react-native';

import { useTheme } from '@/context';

import { Button } from './Button';
import { GlassSurface } from './GlassSurface';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: IconName;
  actionLabel?: string;
  onActionPress?: () => void;
  /** Use `inline` inside an existing card (no own border). */
  variant?: 'card' | 'inline';
}

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onActionPress,
  variant = 'card',
}: EmptyStateProps) {
  const { colors } = useTheme();
  const body = (
    <View className={`items-start gap-3 ${variant === 'card' ? 'p-5' : ''}`}>
      {icon ? (
        <View className="h-11 w-11 items-center justify-center rounded-full bg-accent/10">
          <Icon name={icon} color={colors.accent} />
        </View>
      ) : null}
      <View>
        <Text className="text-card-title text-text-primary">{title}</Text>
        {description ? (
          <Text className="mt-1 text-body text-text-secondary">{description}</Text>
        ) : null}
      </View>
      {actionLabel && onActionPress ? (
        <Button
          label={actionLabel}
          variant="secondary"
          size="sm"
          fullWidth={false}
          onPress={onActionPress}
        />
      ) : null}
    </View>
  );
  return variant === 'card' ? <GlassSurface intensity="subtle">{body}</GlassSurface> : body;
}
