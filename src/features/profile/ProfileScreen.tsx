import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import {
  AppCard,
  ErrorState,
  ListRow,
  ScreenContainer,
  SectionHeader,
  SegmentedControl,
} from '@/components';
import { APP_NAME } from '@/constants';
import { useRecords, useSettings, useTheme } from '@/context';
import type { UserSettings } from '@/types';

const THEME_OPTIONS = [
  { value: 'system', label: 'Systemowy' },
  { value: 'light', label: 'Jasny' },
  { value: 'dark', label: 'Ciemny' },
] as const satisfies readonly { value: UserSettings['theme']; label: string }[];

export function ProfileScreen() {
  const { preference, setPreference } = useTheme();
  const { error: settingsError } = useSettings();
  const { records } = useRecords();
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
