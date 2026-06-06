import { apiClient } from '@/src/services/api/client';
import type { AudioFormat, Podcast, DurationMin, TtsVoice } from './model';

export interface UploadFileResponse {
  fileId: string;
  filename: string;
  contentType: string;
  size: number;
  extractedTextChars: number;
}

export interface CreateJobParams {
  fileId: string;
  notebookId: string;
  durationMinutes?: DurationMin;
  format?: 'summary';
  detailLevel?: 'brief' | 'normal' | 'detailed';
  voiceStyle?: 'friendly' | 'professor';
  speed?: 'slow' | 'normal' | 'fast';
}

export interface CreateJobResponse {
  jobId: string;
  status: string;
  step: string;
  progress: number;
  contentId: string | null;
  error: string | null;
}

// BE 응답을 FE Podcast 도메인 모델로 매핑하는 어댑터
export function mapBEPodcastToFE(be: any): Podcast {
  const voiceStyle = be.metadata?.tts?.voiceStyle;
  const feVoice: TtsVoice =
    voiceStyle === 'friendly' ? 'friend' : voiceStyle || 'friend';

  const format = be.metadata?.script?.format;
  const feFormat: AudioFormat =
    format === 'summary' ? 'dialog' : format || 'dialog';

  let audioUrl = be.audioUrl || null;
  if (audioUrl) {
    if (audioUrl.startsWith('/')) {
      const baseURL = apiClient.defaults.baseURL
        ? apiClient.defaults.baseURL.replace(/\/+$/, '')
        : '';
      audioUrl = `${baseURL}${audioUrl}`;
    } else if (
      audioUrl.includes('localhost:8000') ||
      audioUrl.includes('127.0.0.1:8000')
    ) {
      const baseURL = apiClient.defaults.baseURL
        ? apiClient.defaults.baseURL.replace(/\/+$/, '')
        : '';
      audioUrl = audioUrl.replace(
        /https?:\/\/(localhost|127\.0\.0\.1):8000/,
        baseURL,
      );
    }
  }

  return {
    id: be.contentId || be.id || '',
    userId: 'u_demo',
    title: be.title || be.filename || '무제 팟캐스트',
    duration: be.metadata?.script?.durationMinutes || 10,
    format: feFormat,
    ttsVoice: feVoice,
    script: be.script || '',
    audioUrl,
    status: 'done',
    createdAt: be.createdAt || new Date().toISOString(),
  };
}

export const podcastsApi = {
  // GET /podcasts (기존 오디오 목록 조회)
  list: () =>
    apiClient
      .get<any[]>('/api/v1/podcasts')
      .then((r) => r.data.map(mapBEPodcastToFE)),

  // GET /podcasts/{podcast_id}
  detail: (id: string) =>
    apiClient
      .get<any>(`/api/v1/podcasts/${id}`)
      .then((r) => mapBEPodcastToFE(r.data)),

  // DELETE /podcasts/{podcast_id}
  remove: (id: string) =>
    apiClient.delete<void>(`/api/v1/podcasts/${id}`).then((r) => r.data),

  // POST /jobs (팟캐스트 생성 요청)
  createJob: (params: CreateJobParams) => {
    const body = {
      file_id: params.fileId,
      notebook_id: params.notebookId,
      duration_minutes: params.durationMinutes,
      format: params.format,
      detail_level: params.detailLevel,
      voice_style: params.voiceStyle,
      speed: params.speed,
    };
    return apiClient
      .post<CreateJobResponse>('/api/v1/jobs', body)
      .then((r) => r.data);
  },
};
