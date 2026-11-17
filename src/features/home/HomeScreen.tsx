import { router } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { IconButton, ScreenContainer, ScreenHeader } from '@/components';
import { useRecords } from '@/context';
import { buildRecordsOverview } from '@/utils';

import { PlanCard } from './PlanCard';
import { ProgressSummary } from './ProgressSummary';
import { QuickTools } from './QuickTools';

function greetingFor(date: Date): string {
  const hour = date.getHours();
  if (hour < 5) return 'Dobry wieczór';
  if (hour < 18) return 'Dzień dobry';
  return 'Dobry wieczór';
}

function formatToday(date: Date): string {
  try {
    return date.toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return '';
  }
}

export function HomeScreen() {
  const { records, isLoading, error, reloadRecords } = useRecords();
  const overview = useMemo(() => buildRecordsOverview(records, 3), [records]);
  const now = new Date();

  return (
    <ScreenContainer>
      <ScreenHeader
        eyebrow={formatToday(now)}
        title={greetingFor(now)}
        right={
          <IconButton
            icon="user"
            accessibilityLabel="Profil i ustawienia"
            onPress={() => router.push('/profile')}
          />
        }
      />

      <View className="gap-8">
        {/* Workout plans are not persisted yet — the card shows an honest empty state. */}
        <PlanCard plan={null} />
        <QuickTools />
        <ProgressSummary
          overview={overview}
          isLoading={isLoading && records.length === 0}
          error={error}
          onRetry={() => void reloadRecords()}
        />
      </View>
    </ScreenContainer>
  );
}
