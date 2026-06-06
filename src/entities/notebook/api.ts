import { apiClient } from '@/src/services/api/client';
import type { Notebook, Source } from './model';
import { mapBEPodcastToFE } from '../podcast/api';

export const notebooksApi = {
  // GET /notebooks
  list: () =>
    apiClient.get<any[]>('/api/v1/notebooks').then((r) =>
      r.data.map((nb) => {
        if (nb && Array.isArray(nb.podcasts)) {
          nb.podcasts = nb.podcasts.map(mapBEPodcastToFE);
        }
        return nb as Notebook;
      }),
    ),

  // GET /notebooks/{id}
  detail: (id: string) =>
    apiClient.get<any>(`/api/v1/notebooks/${id}`).then((r) => {
      const data = r.data;
      if (data && Array.isArray(data.podcasts)) {
        data.podcasts = data.podcasts.map(mapBEPodcastToFE);
      }
      return data as Notebook;
    }),

  // POST /notebooks
  create: (title: string) =>
    apiClient.post<any>('/api/v1/notebooks', { title }).then((r) => {
      const data = r.data;
      if (data && Array.isArray(data.podcasts)) {
        data.podcasts = data.podcasts.map(mapBEPodcastToFE);
      }
      return data as Notebook;
    }),

  // DELETE /notebooks/{id}
  remove: (id: string) =>
    apiClient.delete<void>(`/api/v1/notebooks/${id}`).then((r) => r.data),

  // POST /notebooks/{id}/sources (FormData 파일 업로드 및 소스 추가)
  uploadSource: (
    notebookId: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
  ) => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    return apiClient
      .post<Source>(`/api/v1/notebooks/${notebookId}/sources`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },

  // DELETE /notebooks/{notebookId}/sources/{sourceId}
  removeSource: (notebookId: string, sourceId: string) =>
    apiClient
      .delete<void>(`/api/v1/notebooks/${notebookId}/sources/${sourceId}`)
      .then((r) => r.data),
};
