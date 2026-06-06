import { apiClient } from '@/src/services/api/client';
import type { Job } from './model';

export const jobsApi = {
  // 콘텐츠 생성 진행 상태 폴링용. useJobPolling Hook이 백오프 간격으로 호출한다.
  getJob: (id: string) =>
    apiClient.get<any>(`/api/v1/jobs/${id}`).then((r) => {
      const data = r.data;
      const beStatus = data.status;

      // BE의 pending / running -> FE의 'generating' 또는 'pending'으로 매핑
      let mappedStatus: 'pending' | 'generating' | 'done' | 'failed' =
        'generating';
      if (beStatus === 'done') {
        mappedStatus = 'done';
      } else if (beStatus === 'failed') {
        mappedStatus = 'failed';
      } else if (beStatus === 'pending') {
        mappedStatus = 'pending';
      }

      return {
        id: data.jobId || data.id || id,
        contentId: data.contentId || null,
        status: mappedStatus,
        progress: typeof data.progress === 'number' ? data.progress : 0,
        error: data.error || null,
      } as Job;
    }),
};
