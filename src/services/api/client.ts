import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import camelcaseKeys from 'camelcase-keys';

// 기본값은 Android 에뮬레이터 기준(호스트 localhost = 10.0.2.2).
// iOS 시뮬레이터는 http://localhost:8000, 실기기(Expo Go)는 PC의 LAN IP를
// .env의 EXPO_PUBLIC_API_BASE_URL로 지정한다. (.env.example 참고)
const DEFAULT_BASE_URL = 'http://10.0.2.2:8000';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (__DEV__) {
    // 개발 중 요청 추적용. 운영 빌드에서는 출력되지 않는다.
     
    console.log('[api] →', config.method?.toUpperCase(), config.url);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // 서버 응답이 객체/배열인 경우에만 깊은 변환을 적용한다.
    if (response.data && typeof response.data === 'object') {
      response.data = camelcaseKeys(response.data, { deep: true });
    }
    return response;
  },
  (error: AxiosError) => {
    // 통합 에러 로깅. 실제 사용자 알림은 상위 Hook/Repository에서 처리.
     
    console.warn(
      '[api] ✗',
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.message,
    );
    return Promise.reject(error);
  },
);
