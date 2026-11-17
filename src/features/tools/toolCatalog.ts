import type { Href } from 'expo-router';

import type { IconName } from '@/components';

export interface ToolEntry {
  href: Href;
  /** Short label for dashboard shortcuts. */
  shortLabel: string;
  title: string;
  description: string;
  icon: IconName;
}

/** Single source of truth for the tools hub and dashboard shortcuts. */
export const TOOL_CATALOG: readonly ToolEntry[] = [
  {
    href: '/tools/one-rm',
    shortLabel: '1RM',
    title: 'Kalkulator 1RM',
    description: 'Szacowany maksymalny ciężar i obciążenia robocze',
    icon: 'calculator',
  },
  {
    href: '/tools/timer',
    shortLabel: 'Timer',
    title: 'Timer interwałowy',
    description: 'Rundy pracy i przerw z presetami',
    icon: 'timer',
  },
  {
    href: '/tools/plates',
    shortLabel: 'Talerze',
    title: 'Konwerter talerzy',
    description: 'Ile talerzy założyć na każdą stronę gryfu',
    icon: 'plates',
  },
  {
    href: '/tools/records',
    shortLabel: 'Rekordy',
    title: 'Dziennik PR',
    description: 'Twoje wyniki i rekordy osobiste',
    icon: 'trophy',
  },
];
