// services/api 공개 surface.
// - apiClient: 엔티티별 api 모듈만 import 한다.
// - installMockAdapter: app/ 부트스트랩에서만 호출한다.
export { apiClient } from './client';
export { installMockAdapter } from './mockAdapter';
