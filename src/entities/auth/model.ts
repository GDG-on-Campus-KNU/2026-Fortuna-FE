// Auth 엔티티 도메인 타입.
// 서버 응답은 axios 인터셉터에서 snake_case → camelCase로 변환되므로
// 이 곳 필드명은 모두 camelCase 기준. 변경 시 박채빈(BE)과 합의 필수.
//
// BE 계약 (app/api/auth.py 기준):
//   POST /api/v1/auth/signup  body(JSON)            → UserRead
//   POST /api/v1/auth/login   body(form-urlencoded) → { accessToken, tokenType }
//   GET  /api/v1/auth/me      Bearer 토큰           → UserRead

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

// GET /me, POST /signup 응답 (UserRead). created_at/updated_at은 인터셉터가 camelCase 변환.
export interface User {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// POST /login 응답 (Token). token_type → tokenType.
export interface AuthTokens {
  accessToken: string;
  tokenType: string;
}

// 로그인/회원가입 입력. BE 검증: password 8~100자.
export interface Credentials {
  email: string;
  password: string;
}
