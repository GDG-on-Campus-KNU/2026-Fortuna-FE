import { Image } from 'react-native';
import type { Podcast } from '@/src/entities/podcast/model';

// 로컬 오디오 애셋을 Expo AV가 재생할 수 있는 URI 스트링으로 정적 해석합니다.
const getLocalAudioUri = (module: any) => {
  try {
    const source = Image.resolveAssetSource(module);
    return source ? source.uri : '';
  } catch (err) {
     
    console.warn('[MockPodcasts] Failed to resolve asset source', err);
    return '';
  }
};

// 디버그 화면 및 mock-adapter용 더미 데이터.
// 실제 학습 자료를 가정한 그럴듯한 내용으로 채워 BE 미준비 단계 시연에 사용.
export const mockPodcasts: Podcast[] = [
  {
    id: 'c_001',
    userId: 'u_demo',
    title: '프로세스 vs 스레드: 기본 개념 마스터',
    duration: 10,
    format: 'dialog',
    ttsVoice: 'professor',
    script: '... 오늘은 프로세스와 스레드의 기본 차이에 대해 알아보자...',
    get audioUrl() {
      return getLocalAudioUri(
        require('../../../../assets/audios/Sample-1.wav'),
      );
    },
    status: 'done',
    createdAt: '2026-05-12T09:30:00.000Z',
  },
  {
    id: 'c_002',
    userId: 'u_demo',
    title: '프로세스 vs 스레드: 5분 핵심 요약',
    duration: 5,
    format: 'story',
    ttsVoice: 'friend',
    script: '자, 프로세스랑 스레드 차이 한 방에 정리해줄게...',
    get audioUrl() {
      return getLocalAudioUri(
        require('../../../../assets/audios/Sample-2.wav'),
      );
    },
    status: 'done',
    createdAt: '2026-05-13T18:05:00.000Z',
  },
  {
    id: 'c_003',
    userId: 'u_demo',
    title: '프로세스 vs 스레드: 실전 퀴즈와 해설',
    duration: 20,
    format: 'quiz',
    ttsVoice: 'coach',
    script: '첫 번째 문제, 프로세스가 생성될 때 일어나는 일은?...',
    get audioUrl() {
      return getLocalAudioUri(
        require('../../../../assets/audios/Sample-3.wav'),
      );
    },
    status: 'done',
    createdAt: '2026-05-14T07:42:00.000Z',
  },
  {
    id: 'c_004',
    userId: 'u_demo',
    title: '프로세스 vs 스레드: 밤에 듣는 속삭임 요약',
    duration: 5,
    format: 'story',
    ttsVoice: 'whisper',
    script: '오늘의 요약, 조용히 속삭이면서 복습해봐요...',
    get audioUrl() {
      return getLocalAudioUri(
        require('../../../../assets/audios/Sample-4.wav'),
      );
    },
    status: 'done',
    createdAt: '2026-05-15T22:10:00.000Z',
  },
];
