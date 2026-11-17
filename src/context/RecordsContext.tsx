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

import {
  loadPersonalRecords,
  savePersonalRecords,
} from '@/services/personalRecords';
import { StorageError } from '@/services/storage';
import type { PersonalRecord, RecordDraft } from '@/types';
import {
  applyRecordDraft,
  createPersonalRecord,
  filterExerciseGroups,
  findRecordById,
  groupRecordsByExercise,
  removePersonalRecord,
  upsertPersonalRecord,
} from '@/utils/records';

interface RecordsContextValue {
  records: PersonalRecord[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  hasLoaded: boolean;
  reloadRecords: () => Promise<void>;
  addRecord: (draft: RecordDraft) => Promise<PersonalRecord>;
  updateRecord: (id: string, draft: RecordDraft) => Promise<PersonalRecord>;
  deleteRecord: (id: string) => Promise<void>;
  getRecord: (id: string) => PersonalRecord | undefined;
  getGroups: (searchQuery?: string) => ReturnType<typeof groupRecordsByExercise>;
  getExerciseRecords: (exerciseKey: string) => PersonalRecord[];
  clearError: () => void;
}

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  /** In-memory source of truth for serialized writes (avoids stale closures). */
  const recordsRef = useRef<PersonalRecord[]>([]);
  const hasLoadedRef = useRef(false);
  const writeChainRef = useRef<Promise<void>>(Promise.resolve());

  const setRecordsSafe = useCallback((next: PersonalRecord[]) => {
    recordsRef.current = next;
    setRecords(next);
  }, []);

  const enqueueWrite = useCallback(async <T,>(operation: () => Promise<T>): Promise<T> => {
    let release!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const result = new Promise<T>((res, rej) => {
      release = res;
      reject = rej;
    });

    writeChainRef.current = writeChainRef.current
      .catch(() => undefined)
      .then(async () => {
        try {
          const value = await operation();
          release(value);
        } catch (err) {
          reject(err);
          throw err;
        }
      });

    return result;
  }, []);

  const reloadRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stored = await loadPersonalRecords();
      setRecordsSafe(stored);
      hasLoadedRef.current = true;
      setHasLoaded(true);
    } catch (err) {
      const message =
        err instanceof StorageError
          ? err.message
          : 'Nie udało się wczytać dziennika rekordów.';
      setError(message);
      // Do not wipe in-memory records on a failed read after a successful load.
      if (!hasLoadedRef.current) {
        hasLoadedRef.current = true;
        setHasLoaded(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setRecordsSafe]);

  useEffect(() => {
    void reloadRecords();
  }, [reloadRecords]);

  const persist = useCallback(
    async (next: PersonalRecord[]) => {
      setIsSaving(true);
      setError(null);
      try {
        await savePersonalRecords(next);
        setRecordsSafe(next);
      } catch (err) {
        const message =
          err instanceof StorageError
            ? err.message
            : 'Nie udało się zapisać dziennika rekordów.';
        setError(message);
        throw err instanceof Error ? err : new Error(message);
      } finally {
        setIsSaving(false);
      }
    },
    [setRecordsSafe],
  );

  const addRecord = useCallback(
    async (draft: RecordDraft) => {
      return enqueueWrite(async () => {
        const created = createPersonalRecord(draft);
        const next = upsertPersonalRecord(recordsRef.current, created);
        await persist(next);
        return created;
      });
    },
    [enqueueWrite, persist],
  );

  const updateRecord = useCallback(
    async (id: string, draft: RecordDraft) => {
      return enqueueWrite(async () => {
        const existing = findRecordById(recordsRef.current, id);
        if (!existing) {
          throw new Error('Nie znaleziono wpisu do edycji.');
        }
        const updated = applyRecordDraft(existing, draft);
        const next = upsertPersonalRecord(recordsRef.current, updated);
        await persist(next);
        return updated;
      });
    },
    [enqueueWrite, persist],
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      return enqueueWrite(async () => {
        const next = removePersonalRecord(recordsRef.current, id);
        if (next.length === recordsRef.current.length) {
          throw new Error('Nie znaleziono wpisu do usunięcia.');
        }
        await persist(next);
      });
    },
    [enqueueWrite, persist],
  );

  const getRecord = useCallback(
    (id: string) => findRecordById(records, id),
    [records],
  );

  const getGroups = useCallback(
    (searchQuery = '') =>
      filterExerciseGroups(groupRecordsByExercise(records), searchQuery),
    [records],
  );

  const getExerciseRecords = useCallback(
    (exerciseKey: string) =>
      records.filter((item) => item.exerciseKey === exerciseKey),
    [records],
  );

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      records,
      isLoading,
      isSaving,
      error,
      hasLoaded,
      reloadRecords,
      addRecord,
      updateRecord,
      deleteRecord,
      getRecord,
      getGroups,
      getExerciseRecords,
      clearError,
    }),
    [
      records,
      isLoading,
      isSaving,
      error,
      hasLoaded,
      reloadRecords,
      addRecord,
      updateRecord,
      deleteRecord,
      getRecord,
      getGroups,
      getExerciseRecords,
      clearError,
    ],
  );

  return (
    <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>
  );
}

export function useRecords(): RecordsContextValue {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within RecordsProvider');
  }
  return context;
}
