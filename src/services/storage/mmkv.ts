import type { Podcast } from '@/src/entities/podcast/model';
import type { Notebook } from '@/src/entities/notebook/model';
import type { UserPreferences } from '@/src/entities/preferences/model';
import type { OfflineEntry } from '@/src/entities/offline/model';

// mmkv v4는 Nitro Modules 기반의 네이티브 모듈입니다.
// Expo Go 또는 네이티브 모듈 빌드가 안 된 환경(웹 등)에서 앱 크래시가 나지 않도록 메모리 기반 딜백을 설계합니다.
export let storage: {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string | boolean | number) => void;
  clearAll: () => void;
};

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createMMKV } = require('react-native-mmkv');
  storage = createMMKV({ id: 'studycast' });
  // 동작 여부 자체 검증 (에러 유발 테스트)
  storage.getString('__test_nitro__');
} catch {
  const memoryStore = new Map<string, string>();
  storage = {
    getString: (key: string) => memoryStore.get(key),
    set: (key: string, value: string | boolean | number) => {
      memoryStore.set(key, String(value));
    },
    clearAll: () => {
      memoryStore.clear();
    },
  };
   
  console.warn(
    '[Storage] Native NitroModules/MMKV not found. Switched to secure in-memory store.',
  );
}

const KEY = {
  podcasts: 'cache:podcasts',
  notebooks: 'cache:notebooks',
  preferences: 'pref:user',
  offlineMap: 'offline:map',
} as const;

// JSON 직렬화/역직렬화는 항상 페어링한다. write에 stringify를 쓰면 read는 반드시 parse.
function readJson<T>(key: string, fallback: T): T {
  const raw = storage.getString(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    // 손상된 캐시는 무시하고 fallback 반환. 다음 write에서 덮어쓰여진다.
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  storage.set(key, JSON.stringify(value));
}

export const mmkvStore = {
  // ── Podcasts ─────────────────────────────────────────────
  getPodcasts(): Podcast[] {
    return readJson<Podcast[]>(KEY.podcasts, []);
  },
  setPodcasts(list: Podcast[]): void {
    writeJson(KEY.podcasts, list);
  },
  upsertPodcast(p: Podcast): void {
    const rest = this.getPodcasts().filter((x) => x.id !== p.id);
    this.setPodcasts([p, ...rest]);
  },
  removePodcast(id: string): void {
    this.setPodcasts(this.getPodcasts().filter((p) => p.id !== id));
  },

  // ── Notebooks ────────────────────────────────────────────
  getNotebooks(): Notebook[] {
    return readJson<Notebook[]>(KEY.notebooks, []);
  },
  setNotebooks(list: Notebook[]): void {
    writeJson(KEY.notebooks, list);
  },
  upsertNotebook(nb: Notebook): void {
    const rest = this.getNotebooks().filter((x) => x.id !== nb.id);
    this.setNotebooks([nb, ...rest]);
  },
  removeNotebook(id: string): void {
    this.setNotebooks(this.getNotebooks().filter((nb) => nb.id !== id));
  },

  // ── Preferences ──────────────────────────────────────────
  getPreferences(): UserPreferences | null {
    return readJson<UserPreferences | null>(KEY.preferences, null);
  },
  setPreferences(p: UserPreferences): void {
    writeJson(KEY.preferences, p);
  },

  // ── Offline map (podcastId → OfflineEntry) ───────────────
  getOfflineMap(): Record<string, OfflineEntry> {
    return readJson<Record<string, OfflineEntry>>(KEY.offlineMap, {});
  },
  setOfflineMap(m: Record<string, OfflineEntry>): void {
    writeJson(KEY.offlineMap, m);
  },

  // 전체 초기화 (디버그용)
  clear(): void {
    storage.clearAll();
  },
};
