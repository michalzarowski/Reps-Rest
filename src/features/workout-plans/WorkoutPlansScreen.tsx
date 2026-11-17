import { useState } from 'react';
import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GlassPanel, MetricChip, Screen, SectionHeader } from '@/components';
import { demoPlanCategories, demoPlans } from '@/mocks/demo';
import { colors, radii } from '@/theme';

const planThumb = require('../../../assets/images/immersive/progress-training.png');

export function WorkoutPlansScreen() {
  const [category, setCategory] = useState<(typeof demoPlanCategories)[number]>('Wszystkie');

  const filtered =
    category === 'Wszystkie'
      ? demoPlans
      : demoPlans.filter((plan) => plan.category === category);

  return (
    <Screen title="Plany" subtitle="Przeglądaj przykładowe programy — jeszcze bez zapisu.">
      <View className="mb-4 flex-row flex-wrap gap-2">
        {demoPlanCategories.map((item) => {
          const active = item === category;
          return (
            <Pressable
              key={item}
              onPress={() => setCategory(item)}
              style={{
                borderRadius: radii.pill,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderWidth: 1,
                borderColor: active ? colors.aqua : colors.glassBorder,
                backgroundColor: active ? colors.activeGlow : colors.glassFill,
              }}
            >
              <Text
                style={{
                  color: active ? colors.aqua : colors.textSecondary,
                  fontWeight: '600',
                  fontSize: 13,
                }}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Programy" subtitle={`${filtered.length} pozycji`} />

      <View className="gap-3">
        {filtered.map((plan) => (
          <Link key={plan.id} href={`/plans/${plan.id}` as Href} asChild>
            <Pressable className="active:opacity-85">
              <GlassPanel variant="elevated">
                <View className="flex-row gap-3">
                  <Image
                    source={planThumb}
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: radii.sm,
                    }}
                    contentFit="cover"
                  />
                  <View className="flex-1 justify-center">
                    <Text className="text-body font-semibold text-text-primary">
                      {plan.name}
                    </Text>
                    <Text className="mt-1 text-caption text-text-secondary">
                      {plan.frequency}
                    </Text>
                    <View className="mt-2 self-start">
                      <MetricChip
                        label={plan.category}
                        tone={
                          plan.category === 'Siła'
                            ? 'lilac'
                            : plan.category === 'Hipertrofia'
                              ? 'aqua'
                              : 'mint'
                        }
                      />
                    </View>
                  </View>
                </View>
              </GlassPanel>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
