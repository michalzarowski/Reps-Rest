import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import {
  GlassButton,
  GlassPanel,
  Icon,
  ImmersiveImageCard,
  QuickToolButton,
  Screen,
  SectionHeader,
} from '@/components';
import {
  demoBodyWeight,
  demoNextWorkout,
  demoProgressSummary,
  demoQuickTools,
  demoUser,
} from '@/mocks/demo';
import { colors, radii } from '@/theme';

const heroImage = require('../../../assets/images/immersive/hero-training.png');

const maxW = Math.max(...demoBodyWeight.map((e) => e.weightKg));
const minW = Math.min(...demoBodyWeight.map((e) => e.weightKg));
const range = Math.max(maxW - minW, 0.1);

export function HomeScreen() {
  return (
    <Screen>
      <View className="mb-5 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-caption text-text-secondary">Dzień dobry</Text>
          <Text className="mt-1 text-hero text-text-primary">{demoUser.name}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Otwórz profil"
          onPress={() => router.push('/profile' as Href)}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            backgroundColor: colors.activeGlow,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="user" color={colors.aqua} />
        </Pressable>
      </View>

      <ImmersiveImageCard source={heroImage} height={220}>
        <Text className="text-caption font-semibold text-aqua">
          {demoNextWorkout.subtitle}
        </Text>
        <Text className="mt-1 text-title text-text-primary">
          {demoNextWorkout.title}
        </Text>
        <Text className="mt-1 text-caption text-text-secondary">
          {demoNextWorkout.focus} · {demoNextWorkout.durationMin} min
        </Text>
        <View className="mt-4 self-start">
          <GlassButton
            label="Rozpocznij"
            size="sm"
            onPress={() => router.push('/plans/ppl' as Href)}
          />
        </View>
      </ImmersiveImageCard>

      <View className="mt-6">
        <SectionHeader title="Szybkie narzędzia" />
        <View className="mt-1 flex-row justify-between">
          {demoQuickTools.map((tool) => (
            <QuickToolButton
              key={tool.href}
              href={tool.href}
              label={tool.label}
              icon={tool.icon}
            />
          ))}
        </View>
      </View>

      <View className="mt-6">
        <SectionHeader
          title="Aktywność"
          actionLabel="Zobacz wszystko"
          onActionPress={() => router.push('/progress')}
        />
        <GlassPanel variant="elevated">
          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-caption text-text-secondary">Masa ciała</Text>
              <Text className="mt-1 text-title text-text-primary">
                {demoProgressSummary.currentWeightKg.toFixed(1)} kg
              </Text>
            </View>
            <Text className="text-caption text-liquid-mint">−0.9 kg / 7d</Text>
          </View>
          <View className="mt-4 h-16 flex-row items-end justify-between gap-1.5">
            {demoBodyWeight.map((entry) => {
              const n = (entry.weightKg - minW) / range;
              return (
                <View
                  key={entry.date}
                  style={{
                    flex: 1,
                    height: 20 + n * 40,
                    borderRadius: radii.sm / 2,
                    backgroundColor: colors.aqua,
                    opacity: 0.35 + n * 0.55,
                  }}
                />
              );
            })}
          </View>
        </GlassPanel>
      </View>
    </Screen>
  );
}
