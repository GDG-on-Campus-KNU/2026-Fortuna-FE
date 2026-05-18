import { useEffect, useState } from 'react';
import { jobsApi } from './api';
import type { Job } from './model';

// 폴링 정책
// - 처음 10초: 1초 간격
// - 이후: 3초 간격
// - 60초 경과 시 중단
// - status가 'done' | 'failed' 가 되면 즉시 중단
const FAST_INTERVAL_MS = 1_000;
const SLOW_INTERVAL_MS = 3_000;
const FAST_PHASE_LIMIT = 10; // tick 횟수 기준
const MAX_DURATION_MS = 60_000;

interface UseJobPollingResult {
  job: Job | null;
  error: Error | null;
}

export function useJobPolling(jobId: string | null): UseJobPollingResult {
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      return;
    }

    let cancelled = false;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();

    const tick = async (): Promise<void> => {
      if (cancelled) return;

      try {
        const next = await jobsApi.getJob(jobId);
        if (cancelled) return;
        setJob(next);

        if (next.status === 'done' || next.status === 'failed') {
          return;
        }
      } catch (err) {
        if (cancelled) return;
        setError(err as Error);
        // 네트워크 일시 실패는 한 번 더 시도하도록 진행.
      }

      if (Date.now() - startedAt > MAX_DURATION_MS) {
        return;
      }

      attempt += 1;
      const delay =
        attempt < FAST_PHASE_LIMIT ? FAST_INTERVAL_MS : SLOW_INTERVAL_MS;
      timer = setTimeout(tick, delay);
    };

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId]);

  return { job, error };
}
