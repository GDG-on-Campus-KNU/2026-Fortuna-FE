import { useCallback, useState } from 'react';
import { isAxiosError } from 'axios';
import { authRepository } from './repository';
import { useAuthStore } from './store';
import type { AuthStatus, Credentials, User } from './model';

interface UseAuthResult {
  status: AuthStatus;
  user: User | null;
  logout: () => void;
}

// 전역 인증 상태 구독 + 로그아웃. 라우트 가드/헤더 등에서 사용.
export function useAuth(): UseAuthResult {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  return { status, user, logout: authRepository.logout };
}

// 클라이언트 측 비밀번호 검증 (BE 규칙: 8~100자)와 맞춘다.
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 100;

type Mode = 'login' | 'signup';

function messageFor(mode: Mode, error: unknown): string {
  if (isAxiosError(error)) {
    const code = error.response?.status;
    if (mode === 'login' && code === 401) {
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    }
    if (mode === 'signup' && (code === 400 || code === 409)) {
      return '이미 가입된 이메일입니다.';
    }
    if (code === undefined) {
      return '네트워크 연결을 확인해 주세요.';
    }
  }
  return '잠시 후 다시 시도해 주세요.';
}

interface UseAuthFormResult {
  submit: (credentials: Credentials) => Promise<void>;
  submitting: boolean;
  error: string | null;
  clearError: () => void;
}

// 로그인/회원가입 폼 공용 Hook. 성공 시 전역 상태가 바뀌며 가드가 화면을 전환한다.
export function useAuthForm(mode: Mode): UseAuthFormResult {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async ({ email, password }: Credentials) => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !password) {
        setError('이메일과 비밀번호를 입력해 주세요.');
        return;
      }
      if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
        setError(
          `비밀번호는 ${PASSWORD_MIN}~${PASSWORD_MAX}자로 입력해 주세요.`,
        );
        return;
      }

      setSubmitting(true);
      setError(null);
      try {
        const credentials: Credentials = { email: trimmedEmail, password };
        if (mode === 'login') {
          await authRepository.login(credentials);
        } else {
          await authRepository.signup(credentials);
        }
      } catch (e) {
        setError(messageFor(mode, e));
      } finally {
        setSubmitting(false);
      }
    },
    [mode],
  );

  return { submit, submitting, error, clearError };
}
