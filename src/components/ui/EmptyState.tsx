import { Text } from 'react-native';

import { GlassPanel } from './GlassPanel';

interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <GlassPanel variant="soft">
      <Text className="text-body font-semibold text-text-primary">{title}</Text>
      {description ? (
        <Text className="mt-2 text-caption leading-5 text-text-secondary">
          {description}
        </Text>
      ) : null}
    </GlassPanel>
  );
}
