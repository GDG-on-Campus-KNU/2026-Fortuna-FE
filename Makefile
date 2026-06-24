.PHONY: help install start android ios web lint clean reset build-android build-ios

help:
	@echo "Studycast Frontend 주요 명령어 모음:"
	@echo "  make install         - 의존성 패키지 설치 (npm install)"
	@echo "  make start           - Expo 개발 서버 실행 (npx expo start)"
	@echo "  make android         - Android 디바이스/에뮬레이터로 기동 (npx expo run:android)"
	@echo "  make ios             - iOS 디바이스/시뮬레이터로 기동 (npx expo run:ios)"
	@echo "  make web             - 웹 환경으로 실행 (npx expo start --web)"
	@echo "  make lint            - 린트 및 스타일 가이드 점검 (npx expo lint)"
	@echo "  make clean           - node_modules, 캐시 삭제 후 재설치"
	@echo "  make reset           - 프로젝트 리셋 스크립트 실행"
	@echo "  make build-android   - EAS CLI를 통한 Android 로컬 개발 빌드 (.apk/tar)"
	@echo "  make build-ios       - EAS CLI를 통한 iOS 로컬 개발 빌드 (.app/tar)"

install:
	npm install

start:
	npm run start

android:
	npm run android

ios:
	npm run ios

web:
	npm run web

lint:
	npm run lint

build-android:
	npx eas build --platform android --local --profile development

build-ios:
	npx eas build --platform ios --local --profile development

clean:
	@echo "캐시 초기화 및 의존성 재설치 중..."
	watchman watch-del-all || true
	rm -rf node_modules
	rm -rf .expo
	npm install

reset:
	npm run reset-project

