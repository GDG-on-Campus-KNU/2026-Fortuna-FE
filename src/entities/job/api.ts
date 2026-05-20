import { apiClient } from '@/src/services/api/client';
import type { Job } from './model';

export const jobsApi = {
  // 콘텐츠 생성 진행 상태 폴링용. useJobPolling Hook이 백오프 간격으로 호출한다.
  getJob: (id: string) =>
    apiClient.get<Job>(`/jobs/${id}`).then((r) => r.data),
};
