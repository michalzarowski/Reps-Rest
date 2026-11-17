import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import {
  AppCard,
  ErrorState,
  ListDivider,
  ListRow,
  ScreenContainer,
  SectionHeader,
  SegmentedControl,
} from '@/components';
import { APP_NAME } from '@/constants';
import { useBodyWeight, useRecords, useSettings, useTheme } from '@/context';
import type { BodyGoal, UserSettings } from '@/types';
import { BODY_GOAL_LABELS, formatNumberPl } from '@/utils/bodyWeight';

const THEME_OPTIONS = [
  { value: 'system', label: 'Systemowy' },
  { value: 'light', label: 'Jasny' },
  { value: 'dark', label: 'Ciemny' },
] as const satisfies readonly { value: UserSettings['theme']; label: string }[];

export function ProfileScreen() {
  const { preference, setPreference } = useTheme();
  const { settings, error: settingsError } = useSettings();
  const { records } = useRecords();
  const { entries: weightEntries } = useBodyWeight();
  const version = Constants.expoConfig?.version ?? '—';

  return (
    <ScreenContainer>
      <View className="gap-8">
        {settingsError ? <ErrorState message={settingsError} /> : null}

        <View>
          <SectionHeader title="Wygląd" subtitle="Motyw aplikacji zapisywany na urządzeniu." />
          <SegmentedControl
            accessibilityLabel="Motyw aplikacji"
            options={THEME_OPTIONS}
            value={preference}
            onChange={(next) => void setPreference(next)}
          />
        </View>

        <View>
          <SectionHeader title="Dane" />
          <AppCard padding="none" className="overflow-hidden">
            <ListRow
              icon="trophy"
              title="Dziennik PR"
              description={`Zapisane wpisy: ${records.length}`}
              onPress={() => router.push('/tools/records')}
            />
            <ListDivider />
            <ListRow
              icon="scale"
              title="Masa ciała"
              description={`Zapisane pomiary: ${weightEntries.length}`}
              onPress={() => router.push('/progress')}
            />
            <ListDivider />
            <ListRow
              icon="user"
              title="Wzrost i cel"
              description={describeBodyProfile(settings.heightCm, settings.bodyGoal)}
              onPress={() => router.push('/progress/body-profile')}
            />
          </AppCard>
          <Text className="mt-2 text-label text-text-muted">
            Wszystkie dane są przechowywane lokalnie na tym urządzeniu. Aplikacja nie
            wymaga konta.
          </Text>
        </View>

        <View>
          <SectionHeader title="O aplikacji" />
          <AppCard padding="none" className="overflow-hidden">
            <ListRow
              icon="info"
              title={APP_NAME}
              description={`Wersja ${version}`}
              showChevron={false}
            />
          </AppCard>
        </View>
      </View>
    </ScreenContainer>
  );
}

function describeBodyProfile(heightCm: number | null, goal: BodyGoal | null): string {
  const height = heightCm == null ? 'Wzrost nie podany' : `${formatNumberPl(heightCm, 1)} cm`;
  const goalText = goal ? `cel: ${BODY_GOAL_LABELS[goal].toLocaleLowerCase('pl-PL')}` : 'bez celu';
  return `${height} · ${goalText}`;
}
