import { router } from 'expo-router';

import { ListRow } from '@/components';
import type { BodyWeightEntry } from '@/types';
import { formatBodyWeight, formatSignedKg } from '@/utils/bodyWeight';
import { formatDisplayDate } from '@/utils/records';

interface WeightEntryRowProps {
  entry: BodyWeightEntry;
  /** Chronologically previous measurement, for the difference label. */
  previous?: BodyWeightEntry;
}

/** One measurement; tapping opens the edit form. */
export function WeightEntryRow({ entry, previous }: WeightEntryRowProps) {
  const diff = previous ? formatSignedKg(entry.weightKg - previous.weightKg) : null;
  return (
    <ListRow
      title={formatBodyWeight(entry.weightKg)}
      description={
        diff
          ? `${formatDisplayDate(entry.date)} · ${diff} od poprzedniego`
          : formatDisplayDate(entry.date)
      }
      accessibilityHint="Otwiera edycję pomiaru"
      onPress={() =>
        router.push({ pathname: '/progress/weight-form', params: { id: entry.id } })
      }
    />
  );
}
