// Auth 엔티티 공개 API. 화면(app/(auth))과 부트스트랩이 import 하는 진입점.
//
//   import { useAuth, useAuthForm } from '@/src/entities/auth';
//
// 루트 레이아웃 연결(가드)은 PR #12 머지 후 별도 커밋에서 처리한다.
// 그때 필요한 부트스트랩 헬퍼:
//   import { installAuthInterceptor, authRepository } from '@/src/entities/auth';
//   installAuthInterceptor();
//   void authRepository.restoreSession();
export type { AuthStatus, User, AuthTokens, Credentials } from './model';
export { useAuth, useAuthForm } from './hooks';
export { useAuthStore } from './store';
export { authRepository } from './repository';
export { installAuthInterceptor } from './interceptor';
