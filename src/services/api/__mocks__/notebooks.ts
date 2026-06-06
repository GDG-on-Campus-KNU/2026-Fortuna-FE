import type { Notebook } from '@/src/entities/notebook/model';
import { mockPodcasts } from './podcasts';

// 디버그용 mock notebooks 리스트
export const mockNotebooks: Notebook[] = [
  {
    id: 'nb_001',
    title: 'OS 및 자료구조 시험 대비',
    podcasts: [mockPodcasts[0], mockPodcasts[1]],
    sources: [
      {
        id: 'f_1',
        name: '15-다익스트라_알고리즘.pdf',
        type: 'PDF',
        createdAt: '2026-05-12T09:30:00.000Z',
        updatedAt: '2026-05-12T09:30:00.000Z',
      },
      {
        id: 'f_2',
        name: '16-그래프.pdf',
        type: 'PDF',
        createdAt: '2026-05-12T09:30:00.000Z',
        updatedAt: '2026-05-12T09:30:00.000Z',
      },
      {
        id: 'f_3',
        name: '17-트리.pdf',
        type: 'PDF',
        createdAt: '2026-05-12T09:30:00.000Z',
        updatedAt: '2026-05-12T09:30:00.000Z',
      },
    ],
    createdAt: '2026-05-12T09:30:00.000Z',
    updatedAt: '2026-05-13T18:05:00.000Z',
  },
  {
    id: 'nb_002',
    title: '알고리즘 심화 학습',
    podcasts: [mockPodcasts[2], mockPodcasts[3]],
    sources: [
      {
        id: 'f_4',
        name: 'BFS_DFS_개념정리.txt',
        type: 'txt',
        createdAt: '2026-05-14T07:42:00.000Z',
        updatedAt: '2026-05-14T07:42:00.000Z',
      },
    ],
    createdAt: '2026-05-14T07:42:00.000Z',
    updatedAt: '2026-05-15T22:10:00.000Z',
  },
];
