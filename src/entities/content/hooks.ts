import { useCallback, useEffect, useState } from 'react';
import { contentRepository } from './repository';
import { mmkvStore } from '@/src/services/storage/mmkv';
import type { Content } from './model';

interface UseContentsResult {
  data: Content[];
  loading: boolean;
  refresh: () => void;
}

export function useContents(): UseContentsResult {
  const [data, setData] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    contentRepository
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

interface UseContentResult {
  data: Content | null;
  loading: boolean;
  error: Error | null;
}

export function useContent(id: string | null): UseContentResult {
  const [data, setData] = useState<Content | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      return;
    }

    let mounted = true;
    setError(null);

    // 캐시에 같은 id가 있으면 즉시 보여주고, 서버 갱신은 백그라운드.
    const cached = mmkvStore.getContents().find((c) => c.id === id) ?? null;
    setData(cached);
    setLoading(cached === null);

    contentRepository
      .getDetail(id)
      .then((fresh) => {
        if (mounted) setData(fresh);
      })
      .catch((err: Error) => {
        if (mounted) setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  return { data, loading, error };
}
