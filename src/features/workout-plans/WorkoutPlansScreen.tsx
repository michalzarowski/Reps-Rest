import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AppCard, Badge, Icon, ScreenContainer, SectionHeader } from '@/components';
import { useTheme } from '@/context';
import { demoPlanCategories, demoPlans, type DemoPlanCategory } from '@/mocks/demo';

export function WorkoutPlansScreen() {
  const { colors } = useTheme();
  const [category, setCategory] = useState<DemoPlanCategory>('Wszystkie');

  const filtered =
    category === 'Wszystkie'
      ? demoPlans
      : demoPlans.filter((plan) => plan.category === category);

  return (
    <ScreenContainer title="Plany" subtitle="Przykładowe programy treningowe.">
      <AppCard variant="outline" className="mb-6">
        <View className="flex-row gap-3">
          <Icon name="info" size="sm" color={colors.accent} />
          <Text className="flex-1 text-label text-text-secondary">
            Tworzenie i zapisywanie własnych planów jest w przygotowaniu. Poniższe
            programy służą jako inspiracja.
          </Text>
        </View>
      </AppCard>

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Filtr kategorii"
        className="mb-5 flex-row flex-wrap gap-2"
      >
        {demoPlanCategories.map((item) => {
          const active = item === category;
          return (
            <Pressable
              key={item}
              accessibilityRole="radio"
              accessibilityState={{ selected: active, checked: active }}
              onPress={() => setCategory(item)}
              className={`min-h-[36px] justify-center rounded-full border px-4 ${
                active ? 'border-accent bg-accent' : 'border-border bg-surface active:opacity-70'
              }`}
            >
              <Text
                className={`text-label font-semibold ${
                  active ? 'text-on-accent' : 'text-text-secondary'
                }`}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Programy" subtitle={`Liczba programów: ${filtered.length}`} />

      <View className="gap-3">
        {filtered.map((plan) => (
          <AppCard
            key={plan.id}
            onPress={() => router.push({ pathname: '/plans/[id]', params: { id: plan.id } })}
            accessibilityLabel={`${plan.name}, ${plan.frequency}`}
          >
            <View className="flex-row items-center gap-3">
              <View className="flex-1">
                <Text className="text-card-title text-text-primary">{plan.name}</Text>
                <Text className="mt-0.5 text-label text-text-secondary">
                  {plan.frequency} · {plan.duration}
                </Text>
                <View className="mt-2.5">
                  <Badge label={plan.level} tone="neutral" />
                </View>
              </View>
              <Icon name="chevronRight" size="sm" color={colors.textMuted} />
            </View>
          </AppCard>
        ))}
      </View>
    </ScreenContainer>
  );
}
