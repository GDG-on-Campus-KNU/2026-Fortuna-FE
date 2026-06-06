import {
  authRepository,
  installAuthInterceptor,
  useAuth,
} from '@/src/entities/auth';
import { apiClient, BASE_URL, installMockAdapter } from '@/src/services/api';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import {
  GoogleSansFlex_100Thin,
  GoogleSansFlex_200ExtraLight,
  GoogleSansFlex_300Light,
  GoogleSansFlex_400Regular,
  GoogleSansFlex_500Medium,
  GoogleSansFlex_600SemiBold,
  GoogleSansFlex_700Bold,
  GoogleSansFlex_800ExtraBold,
  GoogleSansFlex_900Black,
} from '@expo-google-fonts/google-sans-flex';
import {
  getRemoteConfig,
  setDefaults,
  setConfigSettings,
  fetchAndActivate,
  getValue,
} from '@react-native-firebase/remote-config';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

// 개발 모드(__DEV__)에서 모의 API 서버가 가동되도록 셋업합니다.
installMockAdapter();
// Bearer 토큰 주입 + 401 자동 로그아웃 인터셉터 등록 (멱등).
installAuthInterceptor();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('Failed to prevent auto hide splash screen:', err);
});

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
      router.replace('/signIn');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/');
    }
  }, [status, segments, router]);
}

function useAppFonts() {
  return useFonts({
    'GoogleSansFlex-100': GoogleSansFlex_100Thin,
    'GoogleSansFlex-200': GoogleSansFlex_200ExtraLight,
    'GoogleSansFlex-300': GoogleSansFlex_300Light,
    'GoogleSansFlex-400': GoogleSansFlex_400Regular,
    'GoogleSansFlex-500': GoogleSansFlex_500Medium,
    'GoogleSansFlex-600': GoogleSansFlex_600SemiBold,
    'GoogleSansFlex-700': GoogleSansFlex_700Bold,
    'GoogleSansFlex-800': GoogleSansFlex_800ExtraBold,
    'GoogleSansFlex-900': GoogleSansFlex_900Black,
    'Pretendard-Black': require('../../assets/fonts/Pretendard-Black.otf'),
    'Pretendard-Bold': require('../../assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-ExtraBold': require('../../assets/fonts/Pretendard-ExtraBold.otf'),
    'Pretendard-ExtraLight': require('../../assets/fonts/Pretendard-ExtraLight.otf'),
    'Pretendard-Light': require('../../assets/fonts/Pretendard-Light.otf'),
    'Pretendard-Medium': require('../../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-Regular': require('../../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-SemiBold': require('../../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Thin': require('../../assets/fonts/Pretendard-Thin.otf'),
  });
}

function useInitializeRemoteConfig() {
  useEffect(() => {
    const setupRemoteConfig = async () => {
      try {
        const rc = getRemoteConfig();

        // Remote Config 기본값 설정
        await setDefaults(rc, {
          api_base_url: BASE_URL,
        });

        // 개발 환경에서는 캐시 타임을 0으로 설정하여 즉시 반영되도록 처리
        if (__DEV__) {
          await setConfigSettings(rc, {
            minimumFetchIntervalMillis: 0,
          });
        }

        // 최신 원격 설정 가져오기 및 활성화
        await fetchAndActivate(rc);

        // Remote Config에서 api_base_url 값을 읽어와 Axios apiClient의 baseURL 업데이트
        // 단, .env 파일에 개발자가 직접 EXPO_PUBLIC_API_BASE_URL을 명시한 경우(로컬 테스트 등)에는
        // Remote Config 값으로 덮어쓰지 않고 개발자 설정을 유지합니다.
        const hasExplicitBaseUrl = !!process.env.EXPO_PUBLIC_API_BASE_URL;
        const apiBaseUrl = getValue(rc, 'api_base_url').asString();
        if (apiBaseUrl && !hasExplicitBaseUrl) {
          apiClient.defaults.baseURL = apiBaseUrl;
          console.log(
            `Axios baseURL dynamic update (Remote Config): ${apiBaseUrl}`,
          );
        } else if (hasExplicitBaseUrl) {
          console.log(
            `Axios baseURL preserved from .env config: ${apiClient.defaults.baseURL}`,
          );
        }
        console.log('Firebase Remote Config initialized successfully.');
      } catch (err) {
        console.error('Failed to initialize Firebase Remote Config:', err);
      }
    };

    void setupRemoteConfig();
  }, []);
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  useProtectedRoute();

  const [loaded, error] = useAppFonts();
  useInitializeRemoteConfig();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch((err) => {
        console.warn('Failed to hide splash screen:', err);
      });
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="create"
          options={{ headerShown: false, animation: 'slide_from_right' }}
        />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="notebook/[id]" options={{ headerShown: false }} />
        <Stack.Screen
          name="player"
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="modal"
          options={{ presentation: 'modal', title: 'Modal' }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
