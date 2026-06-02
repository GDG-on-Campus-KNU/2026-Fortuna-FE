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

  mock.onGet('/contents').reply(() => {
    return [200, mockContents.map(toSnakeContent)];
  });

  mock.onGet(/\/contents\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const found = mockContents.find((c) => c.id === id);
    return found ? [200, toSnakeContent(found)] : [404, { error: 'not_found' }];
  });

  mock.onDelete(/\/contents\/.+/).reply(204);

  mock.onPost('/contents').reply((config) => {
    try {
      const { title } = JSON.parse(config.data || '{}');
      const newId = `c_notebook_${Date.now()}`;
      const newNotebook = {
        id: newId,
        userId: 'u_demo',
        title: title || '새 노트북',
        duration: 10 as const,
        format: 'dialog' as const,
        ttsVoice: 'friend' as const,
        script:
          '새로 생성된 노트북입니다. 자료를 업로드하고 팟캐스트를 생성해 보세요.',
        audioUrl: null,
        status: 'done' as const,
        createdAt: new Date().toISOString(),
      };
      mockContents.unshift(newNotebook);
      return [201, toSnakeContent(newNotebook)];
    } catch {
      return [400, { error: 'invalid_payload' }];
    }
  });

  mock.onPost('/generate').reply((config) => {
    try {
      const params = JSON.parse(config.data || '{}');
      const newId = `c_demo_${Date.now()}`;

      const formatLabel =
        params.format === 'dialog'
          ? '대화형'
          : params.format === 'quiz'
            ? '퀴즈형'
            : '스토리형';
      const voiceLabel =
        params.ttsVoice === 'professor'
          ? '교수'
          : params.ttsVoice === 'friend'
            ? '친구'
            : params.ttsVoice === 'coach'
              ? '도전(화난)'
              : '속삭임';

      mockContents.unshift({
        id: newId,
        userId: 'u_demo',
        title: `프로세스 vs 스레드: ${formatLabel} 요약 (${voiceLabel})`,
        duration: params.duration || 10,
        format: params.format || 'dialog',
        ttsVoice: params.ttsVoice || 'friend',
        script: 'AI가 요약 핵심 분석서를 로드하고 오디오를 조립 중입니다...',
        audioUrl: null,
        status: 'generating',
        createdAt: new Date().toISOString(),
      });

      return [202, { job_id: `job_${newId}`, content_id: newId }];
    } catch {
      return [202, { job_id: 'job_demo_001', content_id: 'c_demo_new' }];
    }
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

  // ── Auth (dev) ───────────────────────────────────────────
  // BE 없이도 로그인 플로우를 시연하기 위한 가짜 인증.
  // 라우트 가드가 켜진 뒤에도 dev에서 앱(탭/홈/생성/재생기)에 진입할 수 있게 한다.
  // 어떤 이메일/비밀번호로도 로그인되며, 응답은 snake_case로 내려 인터셉터 변환을 거친다.
  const demoUser = (email: string) => ({
    id: 'u_demo',
    email,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  });

  mock.onPost('/api/v1/auth/login').reply(200, {
    access_token: 'dev-mock-access-token',
    token_type: 'bearer',
  });

  mock.onPost('/api/v1/auth/signup').reply((config) => {
    try {
      const body = JSON.parse(config.data || '{}');
      return [201, demoUser(body.email ?? 'demo@studycast.app')];
    } catch {
      return [201, demoUser('demo@studycast.app')];
    }
  });

  mock.onGet('/api/v1/auth/me').reply(200, demoUser('demo@studycast.app'));

   
  console.log('[mockAdapter] installed — all axios requests are intercepted');
}
