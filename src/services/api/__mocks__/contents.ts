import type { Content } from '@/src/entities/content/model';

// 디버그 화면 및 mock-adapter용 더미 데이터.
// 실제 학습 자료를 가정한 그럴듯한 내용으로 채워 BE 미준비 단계 시연에 사용.
export const mockContents: Content[] = [
  {
    id: 'c_001',
    userId: 'u_demo',
    title: '확률과 통계 - 조건부 확률 핵심',
    duration: 10,
    format: 'dialog',
    ttsVoice: 'professor',
    script: '오늘은 조건부 확률에 대해 알아보자...',
    // 정희균 플레이어 통합 데모용 — 실제 재생 가능한 공개 샘플 mp3.
    // BE 가 준비되면 Signed URL 로 자동 교체된다.
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    status: 'done',
    createdAt: '2026-05-12T09:30:00.000Z',
  },
  {
    id: 'c_002',
    userId: 'u_demo',
    title: '운영체제 - 프로세스 vs 스레드 5분 요약',
    duration: 5,
    format: 'story',
    ttsVoice: 'friend',
    script: '자, 프로세스랑 스레드 차이 한 방에 정리해줄게...',
    audioUrl: 'https://cdn.studycast.dev/audio/c_002.mp3',
    status: 'done',
    createdAt: '2026-05-13T18:05:00.000Z',
  },
  {
    id: 'c_003',
    userId: 'u_demo',
    title: '경제학원론 - 수요 공급 곡선 퀴즈',
    duration: 20,
    format: 'quiz',
    ttsVoice: 'coach',
    script: '첫 번째 문제, 수요 곡선이 우하향하는 이유는?...',
    audioUrl: 'https://cdn.studycast.dev/audio/c_003.mp3',
    status: 'done',
    createdAt: '2026-05-14T07:42:00.000Z',
  },
  {
    id: 'c_004',
    userId: 'u_demo',
    title: '데이터구조 - 해시테이블 30분 심화',
    duration: 30,
    format: 'dialog',
    ttsVoice: 'professor',
    script: '해시테이블의 충돌 해결 전략부터 살펴봅시다...',
    audioUrl: null,
    status: 'generating',
    createdAt: '2026-05-15T11:00:00.000Z',
  },
  {
    id: 'c_005',
    userId: 'u_demo',
    title: '영어 단어 암기송 - DAY 1',
    duration: 5,
    format: 'story',
    ttsVoice: 'friend',
    script: '오늘의 단어 다섯 개, 노래로 외워보자...',
    audioUrl: 'https://cdn.studycast.dev/audio/c_005.mp3',
    status: 'done',
    createdAt: '2026-05-15T22:10:00.000Z',
  },
];
