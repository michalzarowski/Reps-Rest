import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { DEFAULT_SETTINGS } from '@/constants';
import { getItem, setItem, storageKeys, StorageError } from '@/services/storage';
import type { UserSettings } from '@/types';

interface SettingsContextValue {
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  reloadSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reloadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = await getItem<UserSettings>(storageKeys.settings);
      setSettings(stored ?? DEFAULT_SETTINGS);
    } catch (err) {
      const message =
        err instanceof StorageError
          ? err.message
          : 'Could not load settings from local storage.';
      setError(message);
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadSettings();
  }, [reloadSettings]);

  const updateSettings = useCallback(async (patch: Partial<UserSettings>) => {
    setError(null);
    setSettings((current) => {
      const next = { ...current, ...patch };
      void (async () => {
        try {
          await setItem(storageKeys.settings, next);
        } catch (err) {
          const message =
            err instanceof StorageError
              ? err.message
              : 'Could not save settings.';
          setError(message);
        }
      })();
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isLoading,
      error,
      updateSettings,
      reloadSettings,
    }),
    [settings, isLoading, error, updateSettings, reloadSettings],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
