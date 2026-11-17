import { router, useLocalSearchParams } from 'expo-router';
import { Fragment } from 'react';
import { Text, View } from 'react-native';

import {
  AppCard,
  Badge,
  EmptyState,
  Icon,
  ListDivider,
  ScreenContainer,
  SectionHeader,
} from '@/components';
import { useTheme } from '@/context';
import { demoPlans } from '@/mocks/demo';

export function PlanDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = demoPlans.find((item) => item.id === id);

  if (!plan) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="info"
          title="Nie znaleziono programu"
          description="Ten program nie występuje w katalogu przykładów."
          actionLabel="Wróć do planów"
          onActionPress={() => router.replace('/plans')}
        />
      </ScreenContainer>
    );
  }

  const facts = [
    { icon: 'calendar' as const, label: 'Częstotliwość', value: plan.frequency },
    { icon: 'timer' as const, label: 'Czas sesji', value: plan.duration },
    { icon: 'trendingUp' as const, label: 'Poziom', value: plan.level },
  ];

  return (
    <ScreenContainer title={plan.name} subtitle="Przykładowy program">
      <View className="mb-6 flex-row flex-wrap gap-2">
        {plan.tags.map((tag) => (
          <Badge key={tag} label={tag} tone={tag === 'Siła' ? 'lilac' : 'accent'} />
        ))}
      </View>

      <AppCard padding="none" className="mb-8 overflow-hidden">
        {facts.map((fact, index) => (
          <Fragment key={fact.label}>
            {index > 0 ? <ListDivider /> : null}
            <View className="min-h-[52px] flex-row items-center gap-3 px-4 py-3">
              <Icon name={fact.icon} size="sm" color={colors.textSecondary} />
              <Text className="flex-1 text-body text-text-secondary">{fact.label}</Text>
              <Text className="text-body font-semibold text-text-primary">{fact.value}</Text>
            </View>
          </Fragment>
        ))}
      </AppCard>

      <SectionHeader title="Układ tygodnia" />
      <View className="mb-8 gap-2">
        {plan.days.map((slot) => (
          <AppCard key={`${slot.day}-${slot.label}`} padding="sm">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-12 items-center justify-center rounded-sm bg-accent/10">
                <Text className="text-label font-semibold text-accent">{slot.day}</Text>
              </View>
              <Text className="flex-1 text-card-title text-text-primary">{slot.label}</Text>
            </View>
          </AppCard>
        ))}
      </View>

      <EmptyState
        icon="info"
        title="Szczegóły ćwiczeń wkrótce"
        description="Lista ćwiczeń, edycja i zapisywanie planów pojawią się w kolejnym etapie."
      />
    </ScreenContainer>
  );
}
