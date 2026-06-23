import { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
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

  // 응답: 401이면 리프레시 토큰으로 자동 갱신 시도 후 재요청.
  // 갱신 실패 시 강제 로그아웃 처리.
  apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      const url = originalRequest.url ?? '';
      const isSignInRequest = url.includes('/auth/login');
      const isRefreshRequest = url.includes('/auth/refresh');

      // 401 Unauthorized 이고 로그인/리프레시 요청이 아니며 아직 재시도하지 않은 경우
      if (
        error.response?.status === 401 &&
        !isSignInRequest &&
        !isRefreshRequest &&
        !(originalRequest as any)._retry
      ) {
        (originalRequest as any)._retry = true;

        const refreshToken = tokenStore.getRefreshToken();
        if (refreshToken) {
          try {
            // apiClient를 사용해 리프레시 엔드포인트 호출
            // 1) dynamic baseURL (Remote Config) 자동 반영
            // 2) MockAdapter 연동 지원
            // 3) 응답에 대한 camelCase 키 변환 자동 처리
            const response = await apiClient.post<{
              accessToken: string;
              refreshToken: string;
            }>('/api/v1/auth/refresh', {
              refresh_token: refreshToken,
            });

            const {
              accessToken: newAccessToken,
              refreshToken: newRefreshToken,
            } = response.data;

            // 새 토큰 세팅
            tokenStore.set(newAccessToken, newRefreshToken);

            // 기존 요청 재실행
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            // 리프레시 실패 시 강제 로그아웃
            useAuthStore.getState().forceLogout();
            return Promise.reject(refreshError);
          }
        } else {
          // 리프레시 토큰이 없으면 강제 로그아웃
          useAuthStore.getState().forceLogout();
        }
      }

      return Promise.reject(error);
    },
  );
}
