import MockAdapter from 'axios-mock-adapter';
import { apiClient } from './client';
import { mockPodcasts } from './__mocks__/podcasts';
import { mockNotebooks } from './__mocks__/notebooks';
import type { Job } from '@/src/entities/job/model';
import type { AudioFormat, TtsVoice } from '@/src/entities/podcast/model';

// BE가 1주차 안에 준비되지 않을 경우를 대비한 axios-mock-adapter 셋업.
const NETWORK_DELAY_MS = 800;
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

let installed = false;

export function installMockAdapter(): void {
  if (installed || !__DEV__) return;
  if (!USE_MOCK) {
    console.log(
      '[mockAdapter] disabled (EXPO_PUBLIC_USE_MOCK=false) — 실제 BE로 요청합니다',
    );
    return;
  }
  installed = true;

  const mock = new MockAdapter(apiClient, { delayResponse: NETWORK_DELAY_MS });

  // Helper serialization functions (snake_case conversion)
  const toSnakeSource = (s: any) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    created_at: s.createdAt,
    updated_at: s.updatedAt,
  });

  const toSnakePodcast = (p: any) => {
    console.log('[MockAdapter] toSnakePodcast', p.id, 'audioUrl =', p.audioUrl);
    return {
      id: p.id,
      user_id: p.userId,
      title: p.title,
      duration: p.duration,
      format: p.format,
      tts_voice: p.ttsVoice,
      script: p.script,
      audio_url: p.audioUrl,
      status: p.status,
      created_at: p.createdAt,
    };
  };

  const toSnakeNotebook = (n: any) => ({
    id: n.id,
    title: n.title,
    podcasts: (n.podcasts || []).map(toSnakePodcast),
    sources: (n.sources || []).map(toSnakeSource),
    created_at: n.createdAt,
    updated_at: n.updatedAt,
  });

  // ── Notebooks ────────────────────────────────────────────
  mock.onGet('/api/v1/notebooks').reply(() => {
    return [200, mockNotebooks.map(toSnakeNotebook)];
  });

  mock.onGet(/\/api\/v1\/notebooks\/.+/).reply((config) => {
    // /api/v1/notebooks/{id} or /api/v1/notebooks/{id}/sources
    const urlParts = config.url?.split('/') || [];
    const id = urlParts[4];

    const found = mockNotebooks.find((n) => n.id === id);
    if (!found) return [404, { error: 'not_found' }];

    return [200, toSnakeNotebook(found)];
  });

  mock.onPost('/api/v1/notebooks').reply((config) => {
    try {
      const { title } = JSON.parse(config.data || '{}');
      const newId = `nb_demo_${Date.now()}`;
      const newNotebook = {
        id: newId,
        title: title || '새 노트북',
        podcasts: [],
        sources: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockNotebooks.unshift(newNotebook);
      return [201, toSnakeNotebook(newNotebook)];
    } catch {
      return [400, { error: 'invalid_payload' }];
    }
  });

  mock.onDelete(/\/api\/v1\/notebooks\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const index = mockNotebooks.findIndex((n) => n.id === id);
    if (index !== -1) {
      mockNotebooks.splice(index, 1);
    }
    return [204];
  });

  // POST /api/v1/notebooks/{id}/sources (FormData 파일 업로드 및 소스 추가)
  mock.onPost(/\/api\/v1\/notebooks\/.+\/sources/).reply((config) => {
    const urlParts = config.url?.split('/') || [];
    const notebookId = urlParts[4];
    const notebook = mockNotebooks.find((n) => n.id === notebookId);

    if (!notebook) return [404, { error: 'notebook_not_found' }];

    const newSource = {
      id: `src_demo_${Date.now()}`,
      name: '새_업로드_문서.pdf',
      type: 'PDF' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notebook.sources.push(newSource);
    notebook.updatedAt = new Date().toISOString();

    return [201, toSnakeSource(newSource)];
  });

  // DELETE /api/v1/notebooks/{notebookId}/sources/{sourceId}
  mock.onDelete(/\/api\/v1\/notebooks\/.+\/sources\/.+/).reply((config) => {
    const urlParts = config.url?.split('/') || [];
    const notebookId = urlParts[4];
    const sourceId = urlParts[6];

    const notebook = mockNotebooks.find((n) => n.id === notebookId);
    if (notebook) {
      notebook.sources = notebook.sources.filter((s) => s.id !== sourceId);
      notebook.updatedAt = new Date().toISOString();
    }
    return [204];
  });

  // ── Podcasts & Jobs ──────────────────────────────────────
  mock.onGet('/api/v1/podcasts').reply(() => {
    return [200, mockPodcasts.map(toSnakePodcast)];
  });

  mock.onGet(/\/api\/v1\/podcasts\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const found = mockPodcasts.find((c) => c.id === id);
    return found ? [200, toSnakePodcast(found)] : [404, { error: 'not_found' }];
  });

  mock.onDelete(/\/api\/v1\/podcasts\/.+/).reply((config) => {
    const id = config.url?.split('/').pop();
    const index = mockPodcasts.findIndex((p) => p.id === id);
    if (index !== -1) {
      mockPodcasts.splice(index, 1);
    }
    return [204];
  });

  // POST /api/v1/jobs (팟캐스트 생성 요청)
  mock.onPost('/api/v1/jobs').reply((config) => {
    try {
      const params = JSON.parse(config.data || '{}');
      const newPodcastId = `pod_demo_${Date.now()}`;
      const newJobId = `job_demo_${Date.now()}`;

      const formatLabel =
        params.format === 'dialog'
          ? '대화형'
          : params.format === 'quiz'
            ? '퀴즈형'
            : '스토리형';
      const voiceLabel = params.voice_style === 'friendly' ? '친구' : '교수';

      const newPodcast = {
        id: newPodcastId,
        userId: 'u_demo',
        title: `학습 자료 요약 캐스트: ${formatLabel} (${voiceLabel})`,
        duration: params.duration_minutes || 10,
        format: (params.format === 'summary'
          ? 'dialog'
          : 'dialog') as AudioFormat,
        ttsVoice: (params.voice_style === 'friendly'
          ? 'friend'
          : 'professor') as TtsVoice,
        script: 'AI가 요약 핵심 분석서를 로드하고 오디오를 조립 중입니다...',
        audioUrl: null,
        status: 'generating' as const,
        createdAt: new Date().toISOString(),
      };

      // Add to global mockPodcasts
      mockPodcasts.unshift(newPodcast);

      // Also append to the specified notebook for demonstration
      const notebookId = params.notebook_id;
      const notebook =
        mockNotebooks.find((n) => n.id === notebookId) || mockNotebooks[0];
      if (notebook) {
        notebook.podcasts.unshift(newPodcast);
        notebook.updatedAt = new Date().toISOString();
      }

      return [202, { job_id: newJobId, content_id: newPodcastId }];
    } catch {
      return [202, { job_id: 'job_demo_001', content_id: 'pod_demo_new' }];
    }
  });

  // 폴링 데모: 처음 3회는 generating, 이후 done.
  let jobHits = 0;
  mock.onGet(/\/api\/v1\/jobs\/.+/).reply((config) => {
    const id = config.url?.split('/').pop() ?? 'unknown';
    jobHits += 1;
    const isDone = jobHits > 3;
    const status = isDone ? 'done' : 'generating';

    if (isDone && mockPodcasts.length > 0) {
      // Update the generating status of our podcast to 'done'
      mockPodcasts[0].status = 'done';
      mockPodcasts[0].script =
        '...프로세스와 스레드의 개념을 성공적으로 요약 완료했습니다...';
      if (mockNotebooks.length > 0 && mockNotebooks[0].podcasts.length > 0) {
        mockNotebooks[0].podcasts[0].status = 'done';
        mockNotebooks[0].podcasts[0].script = mockPodcasts[0].script;
      }
    }

    // 응답은 snake_case로 (인터셉터에서 변환됨)
    return [
      200,
      {
        id,
        content_id: mockPodcasts[0]?.id || 'pod_demo_new',
        status,
        progress: Math.min(100, jobHits * 25),
        error: null,
      },
    ];
  });

  // ── Auth (dev) ───────────────────────────────────────────
  const demoUser = (email: string) => ({
    id: 'u_demo',
    email,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  });

  mock.onPost('/api/v1/auth/login').reply(200, {
    access_token: 'dev-mock-access-token',
    refresh_token: 'dev-mock-refresh-token',
    token_type: 'bearer',
  });

  mock.onPost('/api/v1/auth/refresh').reply(200, {
    access_token: 'dev-mock-access-token-new',
    refresh_token: 'dev-mock-refresh-token-new',
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
