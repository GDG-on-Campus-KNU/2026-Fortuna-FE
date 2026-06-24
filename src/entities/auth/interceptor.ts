import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '@/src/services/api/client';
import { tokenStore } from './tokenStore';
import { useAuthStore } from './store';

// services/api/client.ts(기존 로깅 인터셉터)를 수정하지 않고,
// axios의 다중 인터셉터 등록을 이용해 부트스트랩에서 한 번 더 붙인다.
// install*은 멱등하게 동작한다 (중복 등록 방지).
let installed = false;

export function installAuthInterceptor(): void {
  if (installed) return;
  installed = true;

  // 요청: 저장된 토큰이 있으면 Authorization 헤더 주입 (MMKV read는 동기).
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = tokenStore.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // 응답: 401이면 토큰 만료/무효로 보고 강제 로그아웃 → 가드가 로그인 화면으로 보낸다.
  // 단, 로그인 요청 자체의 401(자격 증명 오류)은 화면에서 메시지로 처리하므로 제외한다.
  apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      const url = error.config?.url ?? '';
      const isSignInRequest = url.includes('/auth/login');
      if (error.response?.status === 401 && !isSignInRequest) {
        useAuthStore.getState().forceLogout();
      }
      return Promise.reject(error);
    },
  );
}
