import { router, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { GlassPanel, Icon, Screen, SectionHeader } from '@/components';
import { demoProfileLinks, demoUser } from '@/mocks/demo';
import { colors } from '@/theme';

export function ProfileScreen() {
  return (
    <Screen tabBarInset={false} subtitle={demoUser.motto}>
      <View className="mb-6 items-center">
        <View
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            borderWidth: 2,
            borderColor: colors.aqua,
            backgroundColor: colors.activeGlow,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="user" color={colors.aqua} size="xl" />
        </View>
        <Text className="mt-3 text-title text-text-primary">{demoUser.name}</Text>
      </View>

      <GlassPanel variant="elevated">
        <View className="flex-row justify-between">
          <Stat label="Masa" value={`${demoUser.weightKg} kg`} />
          <Stat label="Wzrost" value={`${demoUser.heightCm} cm`} />
          <Stat label="Wiek" value={`${demoUser.age}`} />
        </View>
      </GlassPanel>

      <View className="mt-6">
        <SectionHeader title="Konto" subtitle="Tylko szkielet UI — bez logowania." />
        <View className="gap-2">
          {demoProfileLinks.map((link) => (
            <Pressable
              key={link.title}
              onPress={() => router.push(link.href as Href)}
              className="active:opacity-80"
            >
              <GlassPanel variant="soft">
                <View className="flex-row items-center gap-3">
                  <Icon name={link.icon} color={colors.aqua} />
                  <Text className="flex-1 text-body font-semibold text-text-primary">
                    {link.title}
                  </Text>
                  <Icon name="chevronRight" color={colors.textMuted} size="sm" />
                </View>
              </GlassPanel>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center px-2">
      <Text className="text-caption text-text-secondary">{label}</Text>
      <Text className="mt-1 text-body font-semibold text-text-primary">{value}</Text>
    </View>
  );
}
