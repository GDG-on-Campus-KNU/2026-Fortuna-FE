import { apiClient } from '@/src/services/api/client';
import type { AuthTokens, Credentials, User } from './model';

// 모든 API 라우터가 `/api/v1` 프리픽스를 쓴다.
const AUTH = '/api/v1/auth';

export const authApi = {
  // signUp은 일반 JSON. password 8~100자는 BE에서 검증한다.
  signUp: (credentials: Credentials) =>
    apiClient.post<User>(`${AUTH}/signup`, credentials).then((r) => r.data),

  // 함정 2: signIn은 OAuth2PasswordRequestForm.
  // - Content-Type: application/x-www-form-urlencoded
  // - 이메일을 `email`이 아니라 `username` 필드에 담는다.
  signIn: (credentials: Credentials) => {
    const body =
      `username=${encodeURIComponent(credentials.email)}` +
      `&password=${encodeURIComponent(credentials.password)}`;
    return apiClient
      .post<AuthTokens>(`${AUTH}/login`, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .then((r) => r.data);
  },

  // 토큰 검증 겸 현재 사용자 프로필. Authorization 헤더는 인터셉터가 주입한다.
  me: () => apiClient.get<User>(`${AUTH}/me`).then((r) => r.data),
};
