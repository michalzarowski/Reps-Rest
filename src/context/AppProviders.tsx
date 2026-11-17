import { ThemeProvider } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';

import { navigationTheme } from '@/theme';

import { RecordsProvider } from './RecordsContext';
import { SettingsProvider } from './SettingsContext';

/**
 * Root composition of app-wide providers.
 * Add new Context providers here as features need shared state.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <RecordsProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style="light" />
          {children}
        </ThemeProvider>
      </RecordsProvider>
    </SettingsProvider>
  );
}
