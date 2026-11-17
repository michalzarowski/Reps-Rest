import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { loadBodyWeightEntries, saveBodyWeightEntries } from '@/services/bodyWeight';
import { StorageError } from '@/services/storage';
import type { BodyWeightDraft, BodyWeightEntry } from '@/types';
import {
  applyBodyWeightDraft,
  createBodyWeightEntry,
  removeBodyWeightEntry,
  upsertBodyWeightEntry,
} from '@/utils/bodyWeight';

interface BodyWeightContextValue {
  /** Newest first. */
  entries: BodyWeightEntry[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasLoaded: boolean;
  reloadEntries: () => Promise<void>;
  addEntry: (draft: BodyWeightDraft) => Promise<BodyWeightEntry>;
  updateEntry: (id: string, draft: BodyWeightDraft) => Promise<BodyWeightEntry>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => BodyWeightEntry | undefined;
  clearError: () => void;
}

const BodyWeightContext = createContext<BodyWeightContextValue | null>(null);

export function BodyWeightProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<BodyWeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  /** In-memory source of truth for serialized writes (avoids stale closures). */
  const entriesRef = useRef<BodyWeightEntry[]>([]);
  const hasLoadedRef = useRef(false);
  const writeChainRef = useRef<Promise<void>>(Promise.resolve());

  const setEntriesSafe = useCallback((next: BodyWeightEntry[]) => {
    entriesRef.current = next;
    setEntries(next);
  }, []);

  const enqueueWrite = useCallback(<T,>(operation: () => Promise<T>): Promise<T> => {
    const run = writeChainRef.current.catch(() => undefined).then(operation);
    writeChainRef.current = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }, []);

  const reloadEntries = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setEntriesSafe(await loadBodyWeightEntries());
    } catch (err) {
      setError(
        err instanceof StorageError ? err.message : 'Nie udało się wczytać historii masy ciała.',
      );
      // Keep whatever is in memory; never wipe on a failed read.
    } finally {
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        setHasLoaded(true);
      }
      setIsLoading(false);
    }
  }, [setEntriesSafe]);

  useEffect(() => {
    void reloadEntries();
  }, [reloadEntries]);

  const persist = useCallback(
    async (next: BodyWeightEntry[]) => {
      setIsSaving(true);
      setError(null);
      try {
        await saveBodyWeightEntries(next);
        setEntriesSafe(next);
      } catch (err) {
        const message =
          err instanceof StorageError ? err.message : 'Nie udało się zapisać pomiaru.';
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [setEntriesSafe],
  );

  const addEntry = useCallback(
    (draft: BodyWeightDraft) =>
      enqueueWrite(async () => {
        if (entriesRef.current.some((item) => item.date === draft.date)) {
          throw new Error('Dla tej daty jest już zapisany pomiar.');
        }
        const created = createBodyWeightEntry(draft);
        await persist(upsertBodyWeightEntry(entriesRef.current, created));
        return created;
      }),
    [enqueueWrite, persist],
  );

  const updateEntry = useCallback(
    (id: string, draft: BodyWeightDraft) =>
      enqueueWrite(async () => {
        const existing = entriesRef.current.find((item) => item.id === id);
        if (!existing) {
          throw new Error('Nie znaleziono pomiaru do edycji.');
        }
        if (entriesRef.current.some((item) => item.date === draft.date && item.id !== id)) {
          throw new Error('Dla tej daty jest już zapisany pomiar.');
        }
        const updated = applyBodyWeightDraft(existing, draft);
        await persist(upsertBodyWeightEntry(entriesRef.current, updated));
        return updated;
      }),
    [enqueueWrite, persist],
  );

  const deleteEntry = useCallback(
    (id: string) =>
      enqueueWrite(async () => {
        const next = removeBodyWeightEntry(entriesRef.current, id);
        if (next.length === entriesRef.current.length) {
          throw new Error('Nie znaleziono pomiaru do usunięcia.');
        }
        await persist(next);
      }),
    [enqueueWrite, persist],
  );

  const getEntry = useCallback(
    (id: string) => entries.find((item) => item.id === id),
    [entries],
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      entries,
      isLoading,
      isSaving,
      error,
      hasLoaded,
      reloadEntries,
      addEntry,
      updateEntry,
      deleteEntry,
      getEntry,
      clearError,
    }),
    [
      entries,
      isLoading,
      isSaving,
      error,
      hasLoaded,
      reloadEntries,
      addEntry,
      updateEntry,
      deleteEntry,
      getEntry,
      clearError,
    ],
  );

  return <BodyWeightContext.Provider value={value}>{children}</BodyWeightContext.Provider>;
}

export function useBodyWeight(): BodyWeightContextValue {
  const context = useContext(BodyWeightContext);
  if (!context) {
    throw new Error('useBodyWeight must be used within BodyWeightProvider');
  }
  return context;
}
