import { authApi } from './api';
import { tokenStore } from './tokenStore';
import { useAuthStore } from './store';
import type { Credentials } from './model';

// API + 토큰 저장소 + 전역 스토어를 결합하는 비즈니스 계층.
// 화면은 Repository를 직접 모른다 — Hook(useAuth)을 통해서만 접근한다.
export const authRepository = {
  // 로그인: 토큰 발급 → 저장 → /me로 검증 겸 프로필 로드 → 인증 상태 확정.
  async login(credentials: Credentials): Promise<void> {
    const { accessToken } = await authApi.login(credentials);
    tokenStore.set(accessToken);
    const user = await authApi.me();
    useAuthStore.getState().setAuthed(user);
  },

  // 회원가입 후 동일 자격 증명으로 자동 로그인까지 이어준다.
  async signup(credentials: Credentials): Promise<void> {
    await authApi.signup(credentials);
    await this.login(credentials);
  },

  logout(): void {
    useAuthStore.getState().forceLogout();
  },

  // 앱 시작 시 1회 호출. 저장된 토큰으로 세션을 복원한다.
  // 토큰 없음 → unauthenticated / 유효 → authenticated / 만료 → 토큰 정리 후 unauthenticated.
  async restoreSession(): Promise<void> {
    const store = useAuthStore.getState();
    if (!tokenStore.get()) {
      store.setStatus('unauthenticated');
      return;
    }
    store.setStatus('loading');
    try {
      const user = await authApi.me();
      store.setAuthed(user);
    } catch {
      store.forceLogout();
    }
  },
};
