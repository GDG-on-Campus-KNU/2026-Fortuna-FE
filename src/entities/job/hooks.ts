import { useEffect, useState } from 'react';
import { jobsApi } from './api';
import type { Job } from './model';

// 폴링 정책
// - 10초 간격으로 최대 5분(300초) 동안 확인
// - status가 'done' | 'failed' 가 되면 즉시 중단
const POLL_INTERVAL_MS = 10_000; // 10초
const MAX_DURATION_MS = 300_000; // 5분

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

      timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [jobId]);

  return { job, error };
}
