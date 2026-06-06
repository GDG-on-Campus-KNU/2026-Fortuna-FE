import { useCallback, useEffect, useState } from 'react';
import { podcastRepository } from './repository';
import { mmkvStore } from '@/src/services/storage/mmkv';
import type { Podcast } from './model';

interface UsePodcastsResult {
  data: Podcast[];
  loading: boolean;
  refresh: () => void;
}

export function usePodcasts(): UsePodcastsResult {
  const [data, setData] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    podcastRepository
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

interface UsePodcastResult {
  data: Podcast | null;
  loading: boolean;
  error: Error | null;
}

export function usePodcast(id: string | null): UsePodcastResult {
  const [data, setData] = useState<Podcast | null>(null);
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
    const cached = mmkvStore.getPodcasts().find((p) => p.id === id) ?? null;
    setData(cached);
    setLoading(cached === null);

    podcastRepository
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
