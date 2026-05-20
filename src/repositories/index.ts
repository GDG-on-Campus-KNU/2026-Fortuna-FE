// CLAUDE.md 가 명시한 정희균(플레이어) 계약 경로.
//   import { resolvePlaybackSource } from '@/src/repositories';
//
// 실제 구현은 entities 안에 있고, 이 파일은 그 진입점만 노출하는 1줄 barrel.
// `@/entities` 와 `@/repositories` 어느 쪽에서 import 해도 동일하게 동작한다.
export {
  resolvePlaybackSource,
  resolvePlaybackTrack,
  type AudioTrack,
} from '@/src/entities/content';
