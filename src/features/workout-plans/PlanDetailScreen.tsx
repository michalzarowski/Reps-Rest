import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

import { EmptyState, GlassPanel, MetricChip, Screen, SectionHeader } from '@/components';
import { demoPlans } from '@/mocks/demo';
import { colors, radii } from '@/theme';

const hero = require('../../../assets/images/immersive/hero-training.png');

export function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const plan = demoPlans.find((item) => item.id === id);

  if (!plan) {
    return (
      <Screen tabBarInset={false}>
        <EmptyState
          title="Nie znaleziono planu"
          description="Ten identyfikator nie występuje w katalogu demonstracyjnym."
        />
      </Screen>
    );
  }

  return (
    <Screen tabBarInset={false}>
      <View
        style={{
          borderRadius: radii.lg,
          overflow: 'hidden',
          height: 180,
          marginBottom: 16,
        }}
      >
        <Image source={hero} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            padding: 16,
            backgroundColor: colors.overlay,
          }}
        >
          <Text className="text-title text-text-primary">{plan.name}</Text>
          <Text className="mt-1 text-caption text-text-secondary">
            {plan.duration} · {plan.level}
          </Text>
        </View>
      </View>

      <View className="mb-4 flex-row flex-wrap gap-2">
        {plan.tags.map((tag) => (
          <MetricChip
            key={tag}
            label={tag}
            tone={tag === 'Siła' ? 'lilac' : 'aqua'}
          />
        ))}
      </View>

      <SectionHeader title="Układ tygodnia" subtitle="Tylko harmonogram demonstracyjny." />
      <View className="mb-4 flex-row flex-wrap gap-2">
        {plan.days.map((slot) => (
          <View key={`${slot.day}-${slot.label}`} style={{ width: '47%' }}>
            <GlassPanel variant="solid">
              <Text className="text-caption text-aqua">{slot.day}</Text>
              <Text className="mt-1 text-body font-semibold text-text-primary">
                {slot.label}
              </Text>
            </GlassPanel>
          </View>
        ))}
      </View>

      <EmptyState
        title="Edycja pojawi się później"
        description="Tworzenie planów, katalog ćwiczeń i lokalny zapis są zaplanowane na kolejny etap."
      />
    </Screen>
  );
}
