import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { installMockAdapter } from '@/src/services/api';
import {
  authRepository,
  installAuthInterceptor,
  useAuth,
} from '@/src/entities/auth';

// 개발 모드(__DEV__)에서 모의 API 서버가 가동되도록 셋업합니다.
installMockAdapter();
// Bearer 토큰 주입 + 401 자동 로그아웃 인터셉터 등록 (멱등).
installAuthInterceptor();

export const unstable_settings = {
  anchor: '(tabs)',
};

// 로그인 상태에 따라 (auth) ↔ (tabs)를 오가는 라우트 가드.
// 앱 시작 시 저장된 토큰으로 세션을 복원하고, 상태가 확정되면 화면을 전환한다.
function useProtectedRoute() {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void authRepository.restoreSession();
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/');
    }
  }, [status, segments, router]);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useProtectedRoute();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
