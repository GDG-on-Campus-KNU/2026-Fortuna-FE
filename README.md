![Light Logo](https://github.com/user-attachments/assets/4d692da2-66cb-4751-9360-3611b9ade797#gh-light-mode-only)
![Dark Logo](https://github.com/user-attachments/assets/90ea1b34-0343-404b-a54b-94e7c1bd460d#gh-dark-mode-only)

# Studycast Frontend

**Studycast Backend** → [GitHub](https://github.com/GDG-on-Campus-KNU/2026-Fortuna-BE)

> **이동 중 낭비되는 시간을 공부 시간으로 바꾸는, AI 팟캐스트 학습 앱**
>
> 사용자의 가용 시간과 선호 스타일에 맞춰 학습 자료를 맞춤형 팟캐스트와 암기송으로 변환해 주는 AI 기반 개인화 오디오 학습 솔루션.

| 홈                                                                                     | 라이브러리                                                                                     | 파일                                                                                     | 플레이어                                                                                     |
| -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| ![홈](https://github.com/user-attachments/assets/a837287f-6274-44b4-a8ad-e50fd2bff0f9) | ![라이브러리](https://github.com/user-attachments/assets/603939dd-2b6b-4adb-82a8-674bdf469987) | ![파일](https://github.com/user-attachments/assets/e3d49d5d-b3f0-40eb-85ab-31d92677e6c7) | ![플레이어](https://github.com/user-attachments/assets/2ecd23d7-e4b6-4b12-9367-45cdc0a06652) |

## 주요 기능

| #   | 기능                           | 설명                                               |
| --- | ------------------------------ | -------------------------------------------------- |
| 1   | 시간별 학습 밀도 자동 조절     | 5 / 10 / 20 / 30분 분량 자동 생성                  |
| 2   | 맞춤형 학습 포맷               | 스토리텔링 · 퀴즈 · 대화식                         |
| 3   | 오디오 플레이어                | 챕터 이동 · 구간 반복 · 0.75x ~ 2x 속도 · 오프라인 |
| 4   | 다양한 성격의 TTS              | 친구형 · 교수형 · 코치형                           |
| 5   | 사용자 자료 기반 스크립트 생성 | PDF / TXT 업로드, 출제 경향 반영                   |

## 기술 스택

프론트엔드 아키텍처 및 코어 구현에 사용된 주요 기술 스택과 라이브러리 목록입니다.

| 분류          | 기술 / 라이브러리                           | 용도 / 특징                                              |
| :------------ | :------------------------------------------ | :------------------------------------------------------- |
| **Core**      | **React Native (Expo SDK 54)** · TypeScript | 크로스 플랫폼 모바일 애플리케이션 프레임워크             |
| **Routing**   | **Expo Router (v3)**                        | 디렉토리 구조 기반의 직관적인 File-based Routing         |
| **State**     | **Zustand (v5)** · **React Query (v5)**     | 글로벌 클라이언트 상태 및 강력한 서버 데이터 동기화/캐싱 |
| **Storage**   | **react-native-mmkv**                       | 네이티브 JSI 기반의 초고속 영속성 Key-Value 저장소       |
| **Network**   | **Axios** (with Interceptors)               | `snake_case` ↔ `camelCase` 데이터 포맷 변환 및 통신      |
| **Audio**     | **expo-audio**                              | 오디오 트랙 재생 제어 및 로컬 오디오 오프라인 지원       |
| **Animation** | **Reanimated (v4)** · **Gesture Handler**   | 네이티브 가속을 통한 고성능 미세 애니메이션 및 제스처    |
| **Firebase**  | **Remote Config**                           | 원격 앱 구성 설정 제어 및 활성화 플래그 분기             |

---

## 프로젝트 구조

Studycast Frontend는 **FSD (Feature-Sliced Design)** 구조와 명확한 단방향 데이터 흐름을 준수하여 개발되었습니다.

```
src/
├── app/                  # Expo Router 라우트 (진입점)
├── screens/              # 레이아웃과 데이터가 바인딩되는 화면 컴포넌트
├── entities/             # 도메인 별 비즈니스 로직 및 코어 훅 (auth, podcast, ...)
├── features/             # 전역 오디오 스토어 및 핵심 재생 기능 컴포넌트
├── components/           # 앱 전반에서 사용 가능한 범용 컴포넌트
├── repositories/         # 데이터 결합 및 추상화 저장소 레이어 (Barrel)
├── services/             # HTTP 클라이언트 및 MMKV 로컬 영속 스토리지 유틸
└── shared/               # 테마 설정, 공통 훅 및 유틸리티 자원
```

> 💡 프로젝트의 상세 아키텍처 및 흐름 제어는 [아키텍처 가이드 문서](docs/architecture.md)에서 더 자세히 볼 수 있습니다.

---

## 문서

협업 및 유지보수를 위한 세부 개발 가이드입니다.

- **[시작하기 (Getting Started)](docs/getting-started.md)**: 패키지 설치, 에뮬레이터 구동 및 Mock 모드 디버깅 가이드
- **[아키텍처 및 폴더 구조 (Architecture)](docs/architecture.md)**: FSD 아키텍처와 단방향 데이터 레이어 규칙 설명
- **[데이터 모델 및 API 명세 (API Guide)](docs/api.md)**: 데이터 명세, SWR 캐시 메커니즘 및 백엔드 인터페이스 요약
- **[코드 스타일 및 Git 워크플로 (Conventions)](docs/conventions.md)**: TS strict 설정, Path Alias, Git 협업 및 브랜치 규칙

---

## Team Fortuna

| 이름   | 역할      | 담당 영역                    | GitHub                                           |
| ------ | --------- | ---------------------------- | ------------------------------------------------ |
| 정희균 | AN (팀장) | 오디오 플레이어 · API 테스트 | [@Segyun](https://github.com/Segyun)             |
| 전현준 | AN        | 데이터 모델 · 백엔드 연동    | [@conny3233](https://github.com/conny3233)       |
| 안소민 | AN        | UI 디자인 · 구현             | [@somin320](https://github.com/somin320)         |
| 박채빈 | BE        | API 설계 · 구현              | [@looksambrook](https://github.com/looksambrook) |
