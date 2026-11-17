import type { ReactNode } from 'react';

import { RecordsProvider } from './RecordsContext';
import { SettingsProvider } from './SettingsContext';
import { ThemeProvider } from './ThemeContext';

/**
 * Root composition of app-wide providers.
 * Add new Context providers here as features need shared state.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <RecordsProvider>{children}</RecordsProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}
