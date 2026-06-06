// Podcast 엔티티 공개 API.
// 외부(features/screens)는 이 index를 통해서만 하위 모듈에 접근한다.

export { usePodcasts, usePodcast } from './hooks';

export { podcastRepository } from './repository';

export {
  resolvePlaybackSource,
  resolvePlaybackTrack,
  type AudioTrack,
} from './playbackSource';

export {
  type Podcast,
  type PodcastStatus,
  type AudioFormat,
  type TtsVoice,
  type DurationMin,
} from './model';
