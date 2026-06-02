import { storage } from '@/src/services/storage';

// 인증 토큰 전용 저장소.
// services/storage/mmkv.ts의 mmkvStore는 건드리지 않고, 같은 파일이 export하는
// `storage` 인스턴스에 auth 전용 네임스페이스 키만 추가한다.
// read는 동기라서 axios 요청 인터셉터에서 그대로 쓸 수 있다.
//
// storage 인터페이스는 getString/set/clearAll만 보장한다(키 단위 삭제 메서드 없음).
// 따라서 로그아웃은 remove 대신 빈 문자열을 저장하고, 빈 값은 '토큰 없음'으로 취급한다.
// clearAll은 contents/preferences 캐시까지 지우므로 여기서 쓰지 않는다.
const KEY = {
  accessToken: 'auth:accessToken',
} as const;

export const tokenStore = {
  get(): string | null {
    const value = storage.getString(KEY.accessToken);
    return value ? value : null;
  },
  set(token: string): void {
    storage.set(KEY.accessToken, token);
  },
  clear(): void {
    storage.set(KEY.accessToken, '');
  },
};
