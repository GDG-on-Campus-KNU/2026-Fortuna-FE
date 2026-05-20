// Content 엔티티 도메인 타입.
// 서버 응답은 axios 인터셉터에서 snake_case → camelCase로 변환되므로
// 이 곳 필드명은 모두 camelCase 기준. 변경 시 박채빈(BE)과 합의 필수.

export type ContentStatus = 'pending' | 'generating' | 'done' | 'failed';

export type AudioFormat = 'dialog' | 'quiz' | 'story';

export type TtsVoice = 'friend' | 'professor' | 'coach';

export type DurationMin = 5 | 10 | 20 | 30;

export interface Content {
  id: string;
  userId: string;
  title: string;
  duration: DurationMin;
  format: AudioFormat;
  ttsVoice: TtsVoice;
  script: string;
  audioUrl: string | null;
  status: ContentStatus;
  createdAt: string;
}
