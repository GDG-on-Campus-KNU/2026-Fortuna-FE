import { createMMKV } from 'react-native-mmkv';
import type { Content } from '@/src/entities/content/model';
import type { UserPreferences } from '@/src/entities/preferences/model';
import type { OfflineEntry } from '@/src/entities/offline/model';

// 앱 전역에서 사용하는 단일 MMKV 인스턴스. id로 네임스페이스 분리.
// mmkv v4는 Nitro Modules 기반이라 `new MMKV()` 대신 `createMMKV()`를 쓴다.
export const storage = createMMKV({ id: 'studycast' });

const KEY = {
  contents: 'cache:contents',
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
  // ── Contents ─────────────────────────────────────────────
  getContents(): Content[] {
    return readJson<Content[]>(KEY.contents, []);
  },
  setContents(list: Content[]): void {
    writeJson(KEY.contents, list);
  },
  upsertContent(c: Content): void {
    const rest = this.getContents().filter((x) => x.id !== c.id);
    this.setContents([c, ...rest]);
  },
  removeContent(id: string): void {
    this.setContents(this.getContents().filter((c) => c.id !== id));
  },

  // ── Preferences ──────────────────────────────────────────
  getPreferences(): UserPreferences | null {
    return readJson<UserPreferences | null>(KEY.preferences, null);
  },
  setPreferences(p: UserPreferences): void {
    writeJson(KEY.preferences, p);
  },

  // ── Offline map (contentId → OfflineEntry) ───────────────
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
