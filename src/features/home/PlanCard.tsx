import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { Button, contentGlow, GlassSurface, Icon } from '@/components';
import { useTheme } from '@/context';
import type { WorkoutPlan } from '@/types';

interface PlanCardProps {
  /** Saved plan to feature; `null` until plan persistence exists. */
  plan: WorkoutPlan | null;
}

function exerciseCountLabel(count: number): string {
  if (count === 1) return '1 ćwiczenie';
  const lastTwo = count % 100;
  const last = count % 10;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return `${count} ćwiczenia`;
  }
  return `${count} ćwiczeń`;
}

/**
 * Horizontal glass hero card: eyebrow, title, meta, one CTA. A glowing outline
 * icon on the right replaces a photo (no training imagery in assets).
 */
export function PlanCard({ plan }: PlanCardProps) {
  const { colors, glass } = useTheme();

  return (
    <GlassSurface intensity="strong" glow>
      <View
        pointerEvents="none"
        className="absolute -right-3 top-1/2 -mt-12 opacity-30"
        style={contentGlow(glass.glow, 16, 1)}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Icon name="dumbbell" size={96} color={colors.accent} />
      </View>

      <View className="p-5 pr-24">
        <Text className="text-label font-semibold uppercase tracking-wider text-accent">
          {plan ? 'Twój plan' : 'Plan treningowy'}
        </Text>
        {plan ? (
          <>
            <Text className="mt-1 text-title text-text-primary" numberOfLines={2}>
              {plan.name}
            </Text>
            <Text className="mt-1 text-body text-text-secondary">
              {exerciseCountLabel(plan.items.length)}
            </Text>
          </>
        ) : (
          <>
            <Text className="mt-1 text-title text-text-primary">Nie masz jeszcze planu</Text>
            <Text className="mt-1 text-body text-text-secondary">
              Kreator planów jest w przygotowaniu. Zobacz przykładowe programy.
            </Text>
          </>
        )}
        <View className="mt-4">
          <Button
            label={plan ? 'Zobacz plan' : 'Przeglądaj programy'}
            size="sm"
            fullWidth={false}
            onPress={() =>
              plan
                ? router.push({ pathname: '/plans/[id]', params: { id: plan.id } })
                : router.push('/plans')
            }
          />
        </View>
      </View>
    </GlassSurface>
  );
}
