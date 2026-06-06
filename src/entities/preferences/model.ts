import type {
  AudioFormat,
  DurationMin,
  TtsVoice,
} from '@/src/entities/podcast/model';

// 사용자 로컬 설정. MVP에서는 서버 동기화 없이 MMKV에만 저장한다.
export interface UserPreferences {
  defaultDuration: DurationMin;
  defaultFormat: AudioFormat;
  defaultVoice: TtsVoice;
  autoDownloadOnWifi: boolean;
  playbackSpeed: number;
}
