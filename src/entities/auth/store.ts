import { create } from 'zustand';
import { tokenStore } from './tokenStore';
import type { AuthStatus, User } from './model';

// 전역 인증 상태.
// content/preferences는 화면 로컬 useState지만, 인증 상태는 루트 라우트 가드가
// 전역에서 구독해야 하므로 features/audio/store/useAudioStore.ts와 동일하게 Zustand를 쓴다.
type AuthState = {
  status: AuthStatus;
  user: User | null;
  setAuthed: (user: User) => void;
  setStatus: (status: AuthStatus) => void;
  // 토큰까지 함께 정리하는 로그아웃. 401 인터셉터/명시적 로그아웃이 공유한다.
  forceLogout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,
  setAuthed: (user) => set({ status: 'authenticated', user }),
  setStatus: (status) => set({ status }),
  forceLogout: () => {
    tokenStore.clear();
    set({ status: 'unauthenticated', user: null });
  },
}));
