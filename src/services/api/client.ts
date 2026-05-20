import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import camelcaseKeys from 'camelcase-keys';

// Android 에뮬레이터에서 호스트 머신의 localhost는 10.0.2.2로 매핑된다.
// TODO(env): react-native-dotenv 또는 react-native-config 도입 후 환경변수로 교체.
const DEFAULT_BASE_URL = 'http://10.0.2.2:8000';

export const apiClient = axios.create({
  baseURL: DEFAULT_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (__DEV__) {
    // 개발 중 요청 추적용. 운영 빌드에서는 출력되지 않는다.
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.warn(
      '[api] ✗',
      error.config?.method?.toUpperCase(),
      error.config?.url,
      error.message,
    );
    return Promise.reject(error);
  },
);
