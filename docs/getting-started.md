# 시작하기 (Getting Started)

이 문서는 Studycast Frontend 프로젝트의 로컬 개발 환경 설정, 앱 실행 및 검증 방법을 안내합니다.

---

## 1. 개발 환경 설정

본 프로젝트는 React Native 및 Expo SDK 54를 기반으로 합니다. Node.js LTS 버전 설치를 권장합니다.

### 1) 의존성 설치

프로젝트 루트 디렉토리에서 아래 명령어를 실행하여 필요한 의존성 라이브러리를 설치합니다.

```bash
npm install
```

---

## 2. 앱 실행 방법

기본적으로 CLI를 통해 Expo 개발 서버를 구동하고, 원하는 플랫폼 환경에서 애플리케이션을 테스트할 수 있습니다.

### 1) 개발 서버 실행

```bash
# 기본 Expo 개발 서버 시작
npx expo start
```

서버 실행 후 터미널에 표시되는 QR 코드를 스캔하거나, 키보드 단축키를 눌러 플랫폼별 실행을 트리거할 수 있습니다.

### 2) 플랫폼별 직접 실행

```bash
# Android 에뮬레이터 또는 디바이스로 실행
npx expo start --android

# iOS 시뮬레이터로 실행 (macOS 환경 필요)
npx expo start --ios

# 웹 브라우저로 실행
npx expo start --web
```

---

## 3. Expo Go 제약사항 및 개발용 빌드

> [!WARNING]
> 본 프로젝트에서 로컬 고성능 캐싱 및 스토리지로 사용하고 있는 **`react-native-mmkv`**는 JSI(JavaScript Interface) 기반의 네이티브 모듈입니다.
> 따라서 **기본 Expo Go 앱에서는 동작하지 않습니다.**

### 로컬 디바이스/시뮬레이터에서 실행하기 위한 대안:

1. **개발 빌드(Dev Client) 생성 및 실행 (권장)**
   - 로컬 네이티브 빌드를 실행하거나 EAS Build를 통해 생성한 Custom Dev Client를 디바이스에 설치하여 실행해야 합니다.
   - Android: `npm run android` (`expo run:android`)
   - iOS: `npm run ios` (`expo run:ios`)
2. **Mock 모드를 통한 검증**
   - 네이티브 빌드 과정 없이 가볍게 UI 및 데이터 바인딩을 확인하고자 하는 경우, 백엔드 없이 제공되는 **Mock 데이터 모드**를 활용할 수 있습니다.

---

## 4. 백엔드 없이 Mock 데이터로 실행 및 검증

개발 편의를 위해 `__DEV__` 환경(로컬 개발 중)에서는 백엔드 API 서버를 띄우지 않고도 프론트엔드의 비즈니스 로직을 검증할 수 있도록 **`axios-mock-adapter`**가 활성화되어 있습니다.

### 검증 화면 진입 경로

앱 실행 후 디버그용 라우터 주소로 이동합니다.

```
# 앱 실행 후 아래 경로로 이동
/data-debug
```

### Mock 모드에서 검증할 수 있는 시나리오

`/data-debug` 화면을 통해 다음 기능들이 완벽하게 작동하는지 시각적으로 즉시 확인 가능합니다.

- **Stale-While-Revalidate (SWR) 동작**: MMKV에 캐싱된 직전 데이터를 화면에 즉시 보여주고, 백그라운드 서버 요청 결과가 수신되면 UI를 최신 상태로 조용히 갱신합니다.
- **데이터 포맷 변환**: 백엔드 사양에 맞춘 `snake_case` API 응답 데이터가 프론트엔드의 `camelCase` 모델로 정상 매핑 및 변환되는지 여부.
- **MMKV 영속성**: 앱을 완전히 재시작한 뒤에도 로컬 스토리지에 저장되어 있던 캐시 데이터가 즉시 유지 및 노출되는지 여부.
- **오디오 플레이어 연동 모델 검증**: `resolvePlaybackTrack(contentId)` 호출 결과가 오디오 플레이어(`useAudioStore`)에서 정상적으로 소비될 수 있는 구조(`AudioTrack` 포맷)를 가졌는지 데이터 형태 검증.

---

## 5. Makefile을 활용한 단축 명령어

프로젝트 루트에 정의된 `Makefile`을 통해 주요 빌드 및 실행 과정을 간단한 매크로 명령어로 다룰 수 있습니다.

```bash
# 사용 가능한 명령어 전체 목록 확인
make help (또는 make)

# 의존성 모듈 설치 (npm install)
make install

# Expo 개발 서버 기동 (npx expo start)
make start

# Android 디바이스/에뮬레이터 실행 (npx expo run:android)
make android

# iOS 디바이스/시뮬레이터 실행 (npx expo run:ios)
make ios

# 웹 환경으로 테스트 실행 (npx expo start --web)
make web

# ESLint/Prettier 코드 품질 및 정렬 스타일 검사 (npx expo lint)
make lint

# watchman 캐시 제거, node_modules 및 .expo 캐시 제거 후 의존성 청정 재설치
make clean

# 프로젝트 설정 기본 상태로 초기화 (scripts/reset-project.js 실행)
make reset

# EAS CLI를 활용하여 로컬에서 Android 개발용 Custom Dev Client 빌드 생성
make build-android

# EAS CLI를 활용하여 로컬에서 iOS 개발용 Custom Dev Client 빌드 생성 (macOS 환경 필요)
make build-ios
```
