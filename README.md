# StudyCast

> **이동 중 낭비되는 시간을 공부 시간으로 바꾸는, AI 팟캐스트 학습 앱**
>
> 사용자의 가용 시간과 선호 스타일에 맞춰 학습 자료를 맞춤형 팟캐스트와 암기송으로 변환해 주는 AI 기반 개인화 오디오 학습 솔루션.

**팀명**: 포르투나 · **분야**: Android 앱 · AI/ML · **2026 GDG on Campus KNU**

---

## 핵심 기능

| # | 기능 | 설명 |
|---|---|---|
| 1 | 시간별 학습 밀도 자동 조절 | 5 / 10 / 20 / 30분 분량 자동 생성 |
| 2 | 맞춤형 학습 포맷 | 스토리텔링 · 퀴즈 · 대화식 |
| 3 | 오디오 플레이어 | 챕터 이동 · 구간 반복 · 0.75x ~ 2x 속도 · 오프라인 |
| 4 | 다양한 성격의 TTS | 친구형 · 교수형 · 코치형 |
| 5 | 사용자 자료 기반 스크립트 생성 | PDF / TXT 업로드, 출제 경향 반영 |
| 6 | 암기 최적화 노래 변환 | 핵심 암기 내용을 노래로 |

---

## 팀 구성 & 담당

| 이름 | 역할 | 담당 영역 | GitHub |
|---|---|---|---|
| 정희균 | AN (팀장) | 오디오 플레이어 | [@Segyun](https://github.com/Segyun) |
| 전현준 | AN | 데이터 모델 (저장·불러오기) | [@conny3233](https://github.com/conny3233) |
| 안소민 | AN | UI 디자인 / 화면 | [@somin320](https://github.com/somin320) |
| 박채빈 | BE | 프롬프트 작업 · 파이프라인 | [@looksambrook](https://github.com/looksambrook) |

---

## 기술 스택

### Frontend
- **React Native (Expo SDK 54)** · TypeScript · Expo Router (file-based routing)
- **상태 관리**: Zustand · @tanstack/react-query
- **로컬 저장소**: `react-native-mmkv` (빠른 KV)
- **HTTP**: Axios (snake_case → camelCase 인터셉터)
- **오디오**: `expo-av`

### Backend
- **FastAPI** (Async) · PostgreSQL + pgvector
- **AI**: Google Gemini 3 Flash (스크립트) · Gemini 3.1 Flash TTS · Suno v4 / Lyria 3 (노래)
- **인프라**: Google Cloud Run · Firebase Auth & FCM · Cloud Storage (Signed URL)

---

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 실행

```bash
# Android 에뮬레이터
npx expo start --android

# iOS 시뮬레이터 (macOS만)
npx expo start --ios

# 메뉴에서 선택 (기본)
npx expo start
```

> ⚠️ **`react-native-mmkv` 는 Expo Go 에서 동작하지 않습니다.** JSI 기반이라 Dev Client 또는 EAS Build 가 필요합니다.
> 데모만 빠르게 보고 싶다면 mock 모드(아래) 로 충분히 검증 가능합니다.

### 3. 데모 화면 (백엔드 없이 mock 으로 실행)

`feat/6` 브랜치는 axios-mock-adapter 가 자동으로 활성화됩니다 (`__DEV__` 일 때).

```
앱 실행 → 라우터로 /data-debug 진입
```

5건의 더미 콘텐츠가 표시되며 다음을 시각적으로 검증할 수 있습니다.

- ✅ Stale-while-revalidate (캐시 즉시 → 자동 갱신)
- ✅ snake_case → camelCase 자동 변환
- ✅ MMKV 영속화 (앱 재시작 후에도 데이터 유지)
- ✅ Player 통합용 `resolvePlaybackTrack` 결과 shape 검증

---

## 프로젝트 구조

```
src/
├── app/                        Expo Router 라우트 (file-based)
│   ├── (tabs)/                   탭 네비게이션
│   ├── _layout.tsx               루트 레이아웃
│   ├── modal.tsx                 모달 라우트
│   └── data-debug.tsx          ← feat/6 데이터 모델 디버그 화면
├── components/                 일반 UI 컴포넌트 (themed-text, haptic-tab, …)
├── shared/                     공통 hooks / 테마 / UI 프리미티브
│
│  ── feat/6 데이터 레이어 (전현준) ──
├── entities/                   도메인 모델 + 비즈니스 로직
│   ├── content/                  Content 엔티티 (model, api, repository, hooks, playbackSource)
│   ├── job/                      생성 작업 폴링 (model, api, hooks)
│   ├── preferences/              사용자 설정 (model, repository, hooks)
│   ├── offline/                  오프라인 다운로드 메타 (model)
│   └── index.ts                  화면이 import 하는 단일 진입점
├── repositories/               CLAUDE.md 계약 경로 (re-export barrel)
│   └── index.ts                  resolvePlaybackSource / resolvePlaybackTrack
└── services/                   인프라 (HTTP · 로컬 저장소)
    ├── api/                      axios client + mock adapter + 더미 데이터
    └── storage/                  MMKV 래퍼
```

---

## 데이터 흐름 원칙

```
화면 (안소민)
    │ Hook 만 호출
    ▼
Hook (전현준 — useContents, useContent, …)
    │ Repository 만 호출
    ▼
Repository (전현준 — contentRepository, …)
    │
    ├─→ API (axios + interceptors)
    └─→ Storage (MMKV)
```

- 화면은 **Hook 만** 안다. Repository · Storage · API 직접 호출 금지.
- Hook 은 **Repository 만** 안다.
- Repository 만 API 와 Storage 를 동시에 안다.
- 이 단방향 의존성을 깨면 BE API 변경이 화면 코드까지 번집니다.

---

## Public API (다른 팀원이 import 하는 것)

### 안소민 (UI 화면) 용

```ts
import {
  useContents,        // 콘텐츠 목록
  useContent,         // 단일 콘텐츠 상세
  usePreferences,     // 사용자 설정
  useJobPolling,      // 생성 작업 폴링 (1s → 3s 백오프)
} from '@/src/entities';
```

### 정희균 (오디오 플레이어) 용

```ts
import { resolvePlaybackTrack } from '@/src/repositories';

// 그대로 useAudioStore.init() 에 넘길 수 있는 AudioTrack 객체를 반환
const track = await resolvePlaybackTrack(contentId);
await useAudioStore.getState().init(track);
```

`AudioTrack` 의 필드는 `{ id, url, title, artist, album, duration(초), description }` 7개로 플레이어 브랜치의 정의와 100% 동일하게 유지됩니다.

---

## 데이터 모델

```ts
export type ContentStatus = 'pending' | 'generating' | 'done' | 'failed';
export type AudioFormat   = 'dialog' | 'quiz' | 'story';
export type TtsVoice      = 'friend' | 'professor' | 'coach';
export type DurationMin   = 5 | 10 | 20 | 30;

export interface Content {
  id: string;
  userId: string;
  title: string;
  duration: DurationMin;      // 분
  format: AudioFormat;
  ttsVoice: TtsVoice;
  script: string;
  audioUrl: string | null;    // Cloud Storage Signed URL
  status: ContentStatus;
  createdAt: string;          // ISO8601
}
```

전체 타입 정의는 [src/entities/content/model.ts](src/entities/content/model.ts), [src/entities/job/model.ts](src/entities/job/model.ts), [src/entities/preferences/model.ts](src/entities/preferences/model.ts), [src/entities/offline/model.ts](src/entities/offline/model.ts) 참고.

---

## 캐싱 전략 — Stale-While-Revalidate

```ts
contentRepository.listWithRevalidate((fresh) => render(fresh))
```

1. MMKV 캐시를 **즉시 반환** → 사용자는 곧바로 화면을 본다
2. 동시에 백그라운드에서 `GET /contents` 호출
3. 응답 도착 → MMKV 갱신 → 콜백으로 화면 재렌더

→ "로딩 → 렌더" 가 아닌 "**캐시 렌더 → 자동 갱신**" 패턴.
→ 네트워크가 끊겨도 마지막 캐시로 화면 유지.

---

## 백엔드 API 계약 (박채빈 확정 전 가정안)

| Method | Path | 설명 |
|---|---|---|
| `POST` | `/contents/upload` | 자료 파일(PDF/TXT) 업로드 |
| `POST` | `/generate` | 콘텐츠 생성 요청 → `{ jobId, contentId }` |
| `GET`  | `/jobs/{id}` | 작업 상태 폴링 |
| `GET`  | `/contents` | 내 콘텐츠 목록 |
| `GET`  | `/contents/{id}` | 콘텐츠 상세 |
| `DELETE` | `/contents/{id}` | 콘텐츠 삭제 |

응답은 모두 JSON. snake_case 필드는 axios 응답 인터셉터에서 camelCase 로 자동 변환됩니다.

---

## 코드 컨벤션

- **TypeScript strict 모드** — `any` 금지, 정 필요하면 `unknown` + type narrowing
- **Path alias**: `@/*` → `./*` (예: `import { useContents } from '@/src/entities'`)
- **Barrel files** (`index.ts`) 로 모듈 export 정리
- **함수형 컴포넌트** + React Hooks
- 한 파일 200줄 초과 시 분리 검토

---

## Git 워크플로

### Branch Strategy

- `main` — 배포
- `dev` — 개발 통합 (default)
- `release` — 배포 전 테스트
- `hotfix` — 긴급 수정
- 작업 브랜치: `이슈타입/이슈번호` (예: `feat/6`)

### Commit Convention

```
[#이슈번호] 커밋 종류: 커밋 내용
```

예: `[#6] feat: 데이터 모델 저장 및 불러오기`

**Commit Type**: `feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore`

---

## 라이선스

본 프로젝트는 2026 GDG on Campus KNU 활동의 일환으로 제작되었습니다.
