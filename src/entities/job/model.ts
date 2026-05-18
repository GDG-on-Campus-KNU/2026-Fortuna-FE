import type { ContentStatus } from '@/src/entities/content/model';

// /generate 호출 후 백그라운드 작업 상태를 추적하는 엔티티.
// BE의 Job/Status Service가 반환하는 row.
export interface Job {
  id: string;
  contentId: string;
  status: ContentStatus;
  progress?: number;
  error?: string;
}
