import { router } from 'expo-router';
import { Fragment } from 'react';

import { AppCard, EmptyState, ListDivider, ScreenContainer } from '@/components';
import { useBodyWeight } from '@/context';

import { WeightEntryRow } from './WeightEntryRow';

/** Full list of measurements, newest first. */
export function WeightHistoryScreen() {
  const { entries } = useBodyWeight();

  return (
    <ScreenContainer>
      {entries.length === 0 ? (
        <EmptyState
          icon="scale"
          title="Brak pomiarów"
          actionLabel="Dodaj pomiar"
          onActionPress={() => router.replace('/progress/weight-form')}
        />
      ) : (
        <AppCard padding="none" className="overflow-hidden">
          {entries.map((entry, index) => (
            <Fragment key={entry.id}>
              {index > 0 ? <ListDivider /> : null}
              <WeightEntryRow entry={entry} previous={entries[index + 1]} />
            </Fragment>
          ))}
        </AppCard>
      )}
    </ScreenContainer>
  );
}
