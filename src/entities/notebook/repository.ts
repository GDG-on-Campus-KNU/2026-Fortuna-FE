import { notebooksApi } from './api';
import { mmkvStore } from '@/src/services/storage/mmkv';
import type { Notebook, Source } from './model';

export const notebookRepository = {
  /**
   * stale-while-revalidate for Notebooks list.
   */
  async listWithRevalidate(
    onUpdate: (fresh: Notebook[]) => void,
  ): Promise<Notebook[]> {
    const cached = mmkvStore.getNotebooks();

    notebooksApi
      .list()
      .then((fresh) => {
        mmkvStore.setNotebooks(fresh);
        onUpdate(fresh);
      })
      .catch((err) => {
        console.warn(
          '[notebookRepository] list revalidate failed, using cache',
          err?.message,
        );
      });

    return cached;
  },

  /**
   * Get detail of a single notebook.
   */
  async getDetail(id: string): Promise<Notebook> {
    try {
      const fresh = await notebooksApi.detail(id);
      mmkvStore.upsertNotebook(fresh);
      return fresh;
    } catch (err) {
      console.warn('[notebookRepository] getDetail failed, trying cache', err);
      const cached = mmkvStore.getNotebooks().find((n) => n.id === id);
      if (!cached) {
        throw new Error(`Notebook not found for id=${id}`);
      }
      return cached;
    }
  },

  /**
   * Create a new notebook.
   */
  async create(title: string): Promise<Notebook> {
    try {
      const fresh = await notebooksApi.create(title);
      mmkvStore.upsertNotebook(fresh);
      return fresh;
    } catch (err) {
      console.warn(
        '[notebookRepository] create API failed, creating locally',
        err,
      );
      // Fallback: Create locally when BE endpoint is not ready.
      const localNotebook: Notebook = {
        id: `nb_local_${Date.now()}`,
        title,
        podcasts: [],
        sources: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mmkvStore.upsertNotebook(localNotebook);
      return localNotebook;
    }
  },

  /**
   * Remove a notebook.
   */
  async remove(id: string): Promise<void> {
    try {
      await notebooksApi.remove(id);
    } catch (err) {
      console.warn('[notebookRepository] remove API failed', err);
    }
    mmkvStore.removeNotebook(id);
  },

  /**
   * Add a source to a notebook.
   */
  async addSource(
    notebookId: string,
    fileUri: string,
    fileName: string,
    mimeType: string,
  ): Promise<Source> {
    try {
      const source = await notebooksApi.uploadSource(
        notebookId,
        fileUri,
        fileName,
        mimeType,
      );

      // getDetail을 호출하면 서버의 최신 정보(새로 추가된 소스가 이미 포함됨)를 받아와 캐시까지 자동 갱신해 줍니다.
      await this.getDetail(notebookId);

      return source;
    } catch (err) {
      console.warn(
        '[notebookRepository] addSource API failed, adding locally',
        err,
      );

      // Fallback mock source
      const mockSource: Source = {
        id: `src_local_${Date.now()}`,
        name: fileName,
        type: fileName.toLowerCase().endsWith('.txt') ? 'txt' : 'PDF',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const notebook = await this.getDetail(notebookId);
      notebook.sources = [
        ...(notebook.sources || []).filter((s) => s.id !== mockSource.id),
        mockSource,
      ];
      notebook.updatedAt = new Date().toISOString();
      mmkvStore.upsertNotebook(notebook);

      return mockSource;
    }
  },

  /**
   * Remove a source from a notebook.
   */
  async removeSource(notebookId: string, sourceId: string): Promise<void> {
    try {
      await notebooksApi.removeSource(notebookId, sourceId);
    } catch (err) {
      console.warn('[notebookRepository] removeSource API failed', err);
    }

    try {
      const notebook = await this.getDetail(notebookId);
      notebook.sources = (notebook.sources || []).filter(
        (s) => s.id !== sourceId,
      );
      notebook.updatedAt = new Date().toISOString();
      mmkvStore.upsertNotebook(notebook);
    } catch (err) {
      console.warn(
        '[notebookRepository] removeSource cache update failed',
        err,
      );
    }
  },
};
