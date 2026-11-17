import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useColorScheme, View } from 'react-native';

import {
  createNavigationTheme,
  glassPalettes,
  palettes,
  themeVars,
  type ColorPalette,
  type ColorSchemeName,
  type GlassPalette,
} from '@/theme';
import type { UserSettings } from '@/types';

import { useSettings } from './SettingsContext';

type ThemePreference = UserSettings['theme'];

interface ThemeContextValue {
  /** Resolved scheme after applying the user preference. */
  scheme: ColorSchemeName;
  colors: ColorPalette;
  glass: GlassPalette;
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Resolves `settings.theme` (system / light / dark) to an active palette,
 * exposes it to NativeWind via CSS variables and to React Navigation.
 * Dark is the brand default when the system reports no preference.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const systemScheme = useColorScheme();
  const preference = settings.theme;

  const scheme: ColorSchemeName =
    preference === 'system'
      ? systemScheme === 'light'
        ? 'light'
        : 'dark'
      : preference;

  const setPreference = useCallback(
    (next: ThemePreference) => updateSettings({ theme: next }),
    [updateSettings],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme,
      colors: palettes[scheme],
      glass: glassPalettes[scheme],
      preference,
      setPreference,
    }),
    [scheme, preference, setPreference],
  );

  const navigationTheme = useMemo(() => createNavigationTheme(scheme), [scheme]);

  return (
    <ThemeContext.Provider value={value}>
      <NavigationThemeProvider value={navigationTheme}>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <View
          style={[
            { flex: 1, backgroundColor: value.colors.background },
            themeVars[scheme],
          ]}
        >
          {children}
        </View>
      </NavigationThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
