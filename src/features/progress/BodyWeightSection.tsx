import { router } from 'expo-router';
import { Fragment, useMemo } from 'react';
import { Text, View } from 'react-native';

import {
  AppCard,
  Button,
  EmptyState,
  ErrorState,
  ListDivider,
  LoadingState,
  SectionHeader,
  StatCard,
} from '@/components';
import { useBodyWeight, useSettings } from '@/context';
import {
  BMI_BAND_LABELS,
  BODY_GOAL_LABELS,
  calculateBmi,
  computeWeightTrend,
  describeWeightTrend,
  formatBodyWeight,
  formatNumberPl,
} from '@/utils/bodyWeight';

import { BmiNote } from './BmiNote';
import { WeightChart } from './WeightChart';
import { WeightEntryRow } from './WeightEntryRow';

const RECENT_COUNT = 5;

const toneClass = {
  neutral: 'text-text-secondary',
  match: 'text-accent',
  differs: 'text-text-secondary',
} as const;

/** "Masa ciała" block of the Postępy tab — all values come from local storage. */
export function BodyWeightSection() {
  const { entries, isLoading, error, reloadEntries } = useBodyWeight();
  const { settings } = useSettings();

  const latest = entries[0];
  const trend = useMemo(() => computeWeightTrend(entries), [entries]);
  const trendText = useMemo(
    () => describeWeightTrend(trend, settings.bodyGoal),
    [trend, settings.bodyGoal],
  );
  const bmi = useMemo(
    () => calculateBmi(latest?.weightKg, settings.heightCm),
    [latest, settings.heightCm],
  );

  const showLoading = isLoading && entries.length === 0;
  const recent = entries.slice(0, RECENT_COUNT);

  return (
    <View>
      <SectionHeader
        title="Masa ciała"
        actionLabel={entries.length > 0 ? 'Dodaj pomiar' : undefined}
        onActionPress={() => router.push('/progress/weight-form')}
      />

      <View className="gap-3">
        {error ? (
          <ErrorState
            message={error}
            actionLabel="Spróbuj ponownie"
            onActionPress={() => void reloadEntries()}
          />
        ) : null}

        {showLoading ? (
          <LoadingState label="Wczytywanie pomiarów…" />
        ) : !latest ? (
          <EmptyState
            icon="scale"
            title="Brak pomiarów"
            description="Zapisz masę ciała z datą, a tutaj pojawi się wykres i trend."
            actionLabel="Dodaj pierwszy pomiar"
            onActionPress={() => router.push('/progress/weight-form')}
          />
        ) : (
          <>
            <AppCard glow>
              <Text className="text-label text-text-secondary">Ostatni pomiar</Text>
              <Text
                className="mt-1 text-display text-text-primary"
                style={{ fontVariant: ['tabular-nums'] }}
              >
                {formatBodyWeight(latest.weightKg)}
              </Text>
              <Text className="text-label text-text-muted">{formatLongDate(latest.date)}</Text>

              <View className="mt-4 gap-0.5">
                <Text className="text-card-title text-text-primary">{trendText.title}</Text>
                <Text className={`text-body ${toneClass[trendText.tone]}`}>
                  {trendText.description}
                </Text>
              </View>

              {entries.length >= 2 ? (
                <View className="mt-4">
                  <WeightChart entries={entries} />
                </View>
              ) : (
                <Text className="mt-4 text-label text-text-muted">
                  Wykres pojawi się po zapisaniu drugiego pomiaru.
                </Text>
              )}
            </AppCard>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <StatCard
                  label="BMI (orientacyjnie)"
                  value={bmi ? formatNumberPl(bmi.value, 1) : '—'}
                  hint={bmi ? BMI_BAND_LABELS[bmi.band] : 'Podaj wzrost'}
                  onPress={() => router.push('/progress/body-profile')}
                  accessibilityLabel={
                    bmi
                      ? `BMI ${formatNumberPl(bmi.value, 1)}, ${BMI_BAND_LABELS[bmi.band]}. Zmień wzrost`
                      : 'BMI niedostępne. Podaj wzrost'
                  }
                />
              </View>
              <View className="flex-1">
                <StatCard
                  label="Cel"
                  value={settings.bodyGoal ? BODY_GOAL_LABELS[settings.bodyGoal] : 'Brak'}
                  hint="Tylko do opisu trendu"
                  onPress={() => router.push('/progress/body-profile')}
                  accessibilityLabel="Zmień cel"
                />
              </View>
            </View>

            <BmiNote />

            <AppCard padding="none" className="overflow-hidden">
              <Text className="px-4 pb-1 pt-4 text-label text-text-secondary">
                Ostatnie pomiary
              </Text>
              {recent.map((entry, index) => (
                <Fragment key={entry.id}>
                  {index > 0 ? <ListDivider /> : null}
                  <WeightEntryRow entry={entry} previous={entries[index + 1]} />
                </Fragment>
              ))}
            </AppCard>

            {entries.length > RECENT_COUNT ? (
              <Button
                label={`Cała historia (${entries.length})`}
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => router.push('/progress/history')}
              />
            ) : null}
          </>
        )}
      </View>
    </View>
  );
}

function formatLongDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  try {
    return new Date(y, m - 1, d).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}
