import { useCallback, useEffect, useState } from 'react';
import { notebookRepository } from './repository';
import { mmkvStore } from '@/src/services/storage/mmkv';
import type { Notebook } from './model';

interface UseNotebooksResult {
  data: Notebook[];
  loading: boolean;
  refresh: () => void;
}

export function useNotebooks(): UseNotebooksResult {
  const [data, setData] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    notebookRepository
      .listWithRevalidate((fresh) => {
        if (mounted) setData(fresh);
      })
      .then((cached) => {
        if (!mounted) return;
        setData(cached);
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [tick]);

  return { data, loading, refresh };
}

interface UseNotebookResult {
  data: Notebook | null;
  loading: boolean;
  error: Error | null;
  refresh: () => void;
  refreshing: boolean;
}

export function useNotebook(id: string | null): UseNotebookResult {
  const [data, setData] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    let mounted = true;
    setError(null);

    const cached = mmkvStore.getNotebooks().find((n) => n.id === id) ?? null;
    setData(cached);

    const isInitial = cached === null;
    if (isInitial) {
      setLoading(true);
    } else {
      setRevalidating(true);
    }

    notebookRepository
      .getDetail(id)
      .then((fresh) => {
        if (mounted) setData(fresh);
      })
      .catch((err: Error) => {
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
          setRevalidating(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id, tick]);

  return { data, loading, error, refresh, refreshing: revalidating };
}
