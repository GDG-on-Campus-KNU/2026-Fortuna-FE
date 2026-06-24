import type { Podcast } from '../podcast/model';

export interface Source {
  id: string;
  name: string;
  type: 'PDF' | 'txt';
  createdAt: string;
  updatedAt: string;
}

export interface Notebook {
  id: string;
  title: string;
  podcasts: Podcast[];
  sources: Source[];
  createdAt: string;
  updatedAt: string;
}
