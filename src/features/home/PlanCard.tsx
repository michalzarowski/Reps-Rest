import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { AppCard, Button, Icon } from '@/components';
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

/** Compact horizontal card for the user's training plan (or its empty state). */
export function PlanCard({ plan }: PlanCardProps) {
  const { colors } = useTheme();

  return (
    <AppCard variant="elevated">
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-md bg-accent/15">
          <Icon name="clipboardList" color={colors.accent} />
        </View>
        <View className="flex-1">
          {plan ? (
            <>
              <Text className="text-label text-text-secondary">Twój plan</Text>
              <Text className="mt-0.5 text-card-title text-text-primary" numberOfLines={2}>
                {plan.name}
              </Text>
              <Text className="mt-1 text-label text-text-secondary">
                {exerciseCountLabel(plan.items.length)}
              </Text>
            </>
          ) : (
            <>
              <Text className="text-card-title text-text-primary">
                Nie masz jeszcze planu
              </Text>
              <Text className="mt-1 text-body text-text-secondary">
                Tworzenie własnych planów jest w przygotowaniu. Na razie możesz
                przejrzeć przykładowe programy.
              </Text>
            </>
          )}
        </View>
      </View>
      <View className="mt-4">
        {plan ? (
          <Button
            label="Zobacz plan"
            onPress={() =>
              router.push({ pathname: '/plans/[id]', params: { id: plan.id } })
            }
          />
        ) : (
          <Button
            label="Przeglądaj programy"
            variant="secondary"
            onPress={() => router.push('/plans')}
          />
        )}
      </View>
    </AppCard>
  );
}
