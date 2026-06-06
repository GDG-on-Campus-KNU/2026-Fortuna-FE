import { podcastsApi, type CreateJobParams } from './api';
import { mmkvStore } from '@/src/services/storage/mmkv';
import type { Podcast } from './model';

// API + MMKV 캐시를 결합하는 비즈니스 계층.
// 화면은 Repository를 직접 모른다 — Hook을 통해서만 접근한다.
export const podcastRepository = {
  /**
   * stale-while-revalidate.
   *
   * - 캐시를 즉시 반환해 화면 첫 렌더를 막지 않는다.
   * - 동시에 서버에서 최신 목록을 받아오고, 도착하면 캐시를 갱신한 뒤
   *   `onUpdate` 콜백으로 화면을 다시 그리게 한다.
   * - 서버가 실패하면 캐시 유지. 사용자에게 깨진 화면이 보이지 않는다.
   */
  async listWithRevalidate(
    onUpdate: (fresh: Podcast[]) => void,
  ): Promise<Podcast[]> {
    const cached = mmkvStore.getPodcasts();

    podcastsApi
      .list()
      .then((fresh) => {
        mmkvStore.setPodcasts(fresh);
        onUpdate(fresh);
      })
      .catch((err) => {
        // 캐시로 표시 유지. 상위 Hook은 별도 에러 토스트를 띄울 수 있다.
        console.warn('[podcastRepository] revalidate failed', err?.message);
      });

    return cached;
  },

  // 상세 화면용. 서버 호출 후 캐시도 함께 갱신.
  async getDetail(id: string): Promise<Podcast> {
    const fresh = await podcastsApi.detail(id);
    mmkvStore.upsertPodcast(fresh);
    return fresh;
  },

  // 서버 삭제 + 캐시 정리 + 오프라인 엔트리 정리.
  async remove(id: string): Promise<void> {
    await podcastsApi.remove(id);
    mmkvStore.removePodcast(id);

    const offlineMap = mmkvStore.getOfflineMap();
    if (offlineMap[id]) {
      delete offlineMap[id];
      mmkvStore.setOfflineMap(offlineMap);
    }
  },

  // 생성 요청. status: 'generating'인 placeholder를 캐시에 미리 INSERT 해서
  // 사용자가 즉시 목록에서 "생성 중" 항목을 볼 수 있게 한다.
  async generate(
    params: CreateJobParams,
    optimistic: Omit<Podcast, 'id' | 'status' | 'audioUrl' | 'createdAt'>,
  ): Promise<{ jobId: string; contentId: string | null }> {
    const result = await podcastsApi.createJob(params);
    mmkvStore.upsertPodcast({
      ...optimistic,
      id: result.contentId || `temp_${Date.now()}`,
      status: 'generating',
      audioUrl: null,
      createdAt: new Date().toISOString(),
    });
    return {
      jobId: result.jobId,
      contentId: result.contentId,
    };
  },
};
