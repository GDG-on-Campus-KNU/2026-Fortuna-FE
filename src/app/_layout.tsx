import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from '@/src/shared/hooks/use-color-scheme';
import { installMockAdapter } from '@/src/services/api';
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

// 개발 모드(__DEV__)에서 모의 API 서버가 가동되도록 셋업합니다.
installMockAdapter();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch((err) => {
  console.warn('Failed to prevent auto hide splash screen:', err);
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
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
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="signin" options={{ headerShown: false }} />
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
