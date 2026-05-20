import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './client';
import { mockContents } from './__mocks__/contents';
import type { Job } from '@/src/entities/job/model';

// BE가 1주차 안에 준비되지 않을 경우를 대비한 axios-mock-adapter 셋업.
// 운영 빌드에서는 절대 활성화하지 않는다.
//
// services → entities 타입 import는 dev-only 픽스처라 허용한다.
// 런타임 의존성은 한쪽 방향(entities → services)을 유지한다.
const NETWORK_DELAY_MS = 800;

let installed = false;

export function installMockAdapter(): void {
  if (installed || !__DEV__) return;
  installed = true;

  const mock = new MockAdapter(apiClient, { delayResponse: NETWORK_DELAY_MS });

  // 의도적으로 snake_case로 응답을 만들어 axios 인터셉터의 변환 동작을 검증한다.
  // mockContents는 camelCase 도메인 타입이므로, 한 번 snake_case로 직렬화한다.
  const toSnakeContent = (c: (typeof mockContents)[number]) => ({
    id: c.id,
    user_id: c.userId,
    title: c.title,
    duration: c.duration,
    format: c.format,
    tts_voice: c.ttsVoice,
    script: c.script,
    audio_url: c.audioUrl,
    status: c.status,
    created_at: c.createdAt,
  });

  mock.onGet('/contents').reply(200, mockContents.map(toSnakeContent));

  mock.onGet(/\/contents\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const found = mockContents.find((c) => c.id === id);
    return found ? [200, toSnakeContent(found)] : [404, { error: 'not_found' }];
  });

  mock.onDelete(/\/contents\/.+/).reply(204);

  mock.onPost('/generate').reply(202, {
    job_id: 'job_demo_001',
    content_id: 'c_demo_new',
  });

  // 폴링 데모: 처음 3회는 generating, 이후 done.
  let jobHits = 0;
  mock.onGet(/\/jobs\/.+/).reply((config) => {
    const id = config.url?.split('/').pop() ?? 'unknown';
    jobHits += 1;
    const job: Job = {
      id,
      contentId: 'c_demo_new',
      status: jobHits > 3 ? 'done' : 'generating',
      progress: Math.min(100, jobHits * 25),
    };
    // 응답은 snake_case로 (인터셉터에서 변환됨)
    return [
      200,
      {
        id: job.id,
        content_id: job.contentId,
        status: job.status,
        progress: job.progress,
      },
    ];
  });

  // eslint-disable-next-line no-console
  console.log('[mockAdapter] installed — all axios requests are intercepted');
}
