# 데이터 모델, 캐싱 및 API 명세 (Data, Cache & API Specification)

Studycast Frontend 내에서 사용되는 핵심 데이터 모델과 캐싱 전략, 그리고 백엔드와의 API 인터페이스 규격을 정의합니다.

---

## 1. 데이터 모델 (Data Models)

애플리케이션 내 비즈니스 로직과 화면 바인딩에 사용되는 주요 데이터 구조입니다.

```typescript
// 콘텐츠 생성 및 처리 상태
export type ContentStatus = 'pending' | 'generating' | 'done' | 'failed';

// 학습 오디오 포맷
export type AudioFormat = 'dialog' | 'quiz' | 'story';

// TTS 음성 스타일
export type TtsVoice = 'friend' | 'professor' | 'coach';

// 팟캐스트 분량
export type DurationMin = 5 | 10 | 20 | 30;

// 콘텐츠 상세 명세
export interface Content {
  id: string;
  userId: string;
  title: string;
  duration: DurationMin; // 단위: 분
  format: AudioFormat;
  ttsVoice: TtsVoice;
  script: string;
  audioUrl: string | null; // Google Cloud Storage Signed URL
  status: ContentStatus;
  createdAt: string; // ISO8601 형식
}
```

---

## 2. Public API 및 사용 예시

도메인 로직이 정의된 `entities` 및 `repositories` 레이어에서 노출하는 공개 인터페이스입니다.

### 1) 화면 UI 컴포넌트용 Hook (`src/entities/index.ts`)

화면 개발자는 직접적인 API 호출 없이 아래 훅들을 사용해 화면을 구성합니다.

```typescript
import {
  useContents, // 내 팟캐스트 콘텐츠 목록 조회
  useContent, // 특정 팟캐스트 상세 정보 조회
  usePreferences, // 사용자 맞춤 학습 설정 조회/수정
  useJobPolling, // 오디오 생성 진행 상태 폴링 (백오프 내장)
} from '@/src/entities';
```

### 2) 오디오 플레이어 연동용 API (`src/repositories/index.ts`)

플레이어 모듈이 특정 팟캐스트의 오디오 트랙 정보를 동적으로 해결(resolve)할 때 호출합니다.

```typescript
import { resolvePlaybackTrack } from '@/src/repositories';
import { useAudioStore } from '@/src/features/audio/store';

// 1. contentId에 해당하는 팟캐스트 트랙 매핑 정보 획득
const track = await resolvePlaybackTrack(contentId);

// 2. 오디오 플레이어 전역 상태 저장소에 로드 및 재생
await useAudioStore.getState().init(track);
```

> **AudioTrack 객체 사양**: `{ id, url, title, artist, album, duration(초), description }`

---

## 3. 캐싱 전략: Stale-While-Revalidate (SWR)

느린 무선 네트워크 환경이나 오프라인 상태에서도 매끄러운 UX를 보장하기 위해 `MMKV` 로컬 저장소와 `React Query`를 결합하여 SWR 패턴을 구현하였습니다.

```
[화면 진입]
   │
   ├─► 1. MMKV 로컬 캐시 조회 (즉시 반환) ──► [화면 렌더링 - 대기시간 0ms]
   │
   └─► 2. 백그라운드 API 서버 요청 (비동기)
              │
              └─► 서버 응답 수신
                       │
                       ├─► 3. MMKV 로컬 캐시 최신화
                       └─► 4. 화면 컴포넌트에 최신 데이터 반영 (조용한 갱신)
```

- **오프라인 동작 보장**: 최초 1회 로드된 리스트는 기기가 오프라인 상태일 때도 마지막으로 캐싱된 화면을 그대로 보장합니다.
- **인터셉터 연동**: 백엔드 API와의 통신에서 `snake_case`로 수신되는 키값들은 `camelCase`로 자동 직렬화된 후 캐싱 및 렌더링됩니다.

---

## 4. 백엔드 API 명세 가정안

프론트엔드와 통신하는 백엔드 API 인터페이스 규격입니다.

| Method     | Path               | Request Body                               | Response Description                                                          |
| :--------- | :----------------- | :----------------------------------------- | :---------------------------------------------------------------------------- |
| **POST**   | `/contents/upload` | `FormData` (file: PDF/TXT)                 | 파일 업로드 완료 정보 및 임시 ID 반환                                         |
| **POST**   | `/generate`        | `{ sourceId, format, ttsVoice, duration }` | 콘텐츠 생성 요청 성공 시 `{ jobId, contentId }` 반환                          |
| **GET**    | `/jobs/{id}`       | -                                          | 해당 오디오 생성 작업의 진행 상태 (`pending`, `generating`, `done`, `failed`) |
| **GET**    | `/contents`        | -                                          | 사용자가 생성한 팟캐스트 콘텐츠 전체 리스트                                   |
| **GET**    | `/contents/{id}`   | -                                          | 특정 팟캐스트의 메타데이터 및 Signed URL                                      |
| **DELETE** | `/contents/{id}`   | -                                          | 특정 팟캐스트 삭제 결과                                                       |
