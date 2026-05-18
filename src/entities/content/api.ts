import { apiClient } from '@/src/services/api/client';
import type { AudioFormat, Content, DurationMin, TtsVoice } from './model';

// `/generate` 요청 바디. 박채빈(BE)과 필드명 합의 후 조정될 수 있음.
export interface GenerateContentParams {
  materialId: string;
  duration: DurationMin;
  format: AudioFormat;
  ttsVoice: TtsVoice;
}

export interface GenerateContentResponse {
  jobId: string;
  contentId: string;
}

export const contentsApi = {
  list: () => apiClient.get<Content[]>('/contents').then((r) => r.data),

  detail: (id: string) =>
    apiClient.get<Content>(`/contents/${id}`).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete<void>(`/contents/${id}`).then((r) => r.data),

  generate: (params: GenerateContentParams) =>
    apiClient
      .post<GenerateContentResponse>('/generate', params)
      .then((r) => r.data),
};
