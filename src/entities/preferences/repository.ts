import { mmkvStore } from '@/src/services/storage/mmkv';
import type { UserPreferences } from './model';

// MVP에서는 사용자 설정을 로컬에만 저장한다. 서버 동기화는 추후 도입.
// 앱 첫 실행 시 기본값을 적용해 null을 노출하지 않는다.
export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultDuration: 10,
  defaultFormat: 'dialog',
  defaultVoice: 'friend',
  autoDownloadOnWifi: true,
  playbackSpeed: 1.0,
};

export const preferencesRepository = {
  get(): UserPreferences {
    return mmkvStore.getPreferences() ?? DEFAULT_PREFERENCES;
  },
  set(prefs: UserPreferences): void {
    mmkvStore.setPreferences(prefs);
  },
  update(patch: Partial<UserPreferences>): UserPreferences {
    const next = { ...this.get(), ...patch };
    mmkvStore.setPreferences(next);
    return next;
  },
};
