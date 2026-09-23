# 쪽쪽 (zzokzzok) 🍼

아기 수유 시작/종료를 한 번의 탭으로 기록하고, 수유가 끝난 뒤 설정한 시간이 지나면
**"OO아~ 맘마먹자"** 알림으로 다음 수유 시간을 알려주는 앱.

- Android 앱(APK) · iOS 앱(동일 코드, Xcode 빌드) · PWA(브라우저/홈화면 설치) 모두 지원
- 서버 없음. 모든 데이터는 기기 안에만 저장
- React 19 + TypeScript + Vite · Capacitor 8 · Vitest

## 문서

| 문서 | 내용 |
|---|---|
| [docs/01-기획서.md](docs/01-기획서.md) | 배경, 목표, 기능/비기능 요구사항(FR/NFR), 알림 정책, 데이터 모델 |
| [docs/02-프로토타입.md](docs/02-프로토타입.md) | 디자인 컨셉·토큰, 상태 머신, 화면 와이어프레임, 인터랙션, 파일 구조 |
| [docs/prototype/index.html](docs/prototype/index.html) | 클릭 가능한 저충실도 프로토타입 (브라우저로 열기) |
| [docs/03-테스트계획.md](docs/03-테스트계획.md) | 테스트 전략, 요구사항 ↔ 테스트케이스 매핑, 수동 QA 체크리스트 |
| [docs/04-배포가이드.md](docs/04-배포가이드.md) | Google Play / App Store 배포 절차, CI, 체크리스트 |
| [docs/privacy-policy.md](docs/privacy-policy.md) | 스토어 등록용 개인정보 처리방침 |

## 빠른 시작

```bash
npm install
npm test            # 단위 + 컴포넌트 테스트 (Vitest)
npm run dev         # 브라우저 개발 서버 (http://localhost:5173)
npm run build       # 웹 빌드 → dist/ (PWA)
npm run preview     # 빌드 결과 미리보기 (http://localhost:4173, LAN 공개)
```

## Android APK 빌드

툴체인(JDK 21, Android SDK)은 `~/.local` 아래에 root 권한 없이 설치되어 있다.
다른 PC에서는 `scripts/android-env.sh` 의 경로만 맞추면 된다.

```bash
source scripts/android-env.sh
npm run build && npx cap sync android
cd android && ./gradlew assembleDebug
# → android/app/build/outputs/apk/debug/app-debug.apk
```

한 줄 스크립트: `npm run android:apk` (같은 작업을 수행하고 APK 를 `release/` 로 복사)

폰에 설치: APK 파일을 폰으로 옮겨 열기(출처를 알 수 없는 앱 허용) 또는 `adb install release/zzokzzok-debug.apk`

### 스토어 배포 (릴리스 서명)

업로드 키는 `android/keystore/`(git 제외)에 있다. 자세한 절차는 [docs/04-배포가이드.md](docs/04-배포가이드.md).

```bash
npm run android:release   # → release/zzokzzok-<버전>.aab (Play 업로드), release/zzokzzok-<버전>-release.apk
```

`v0.1.0` 처럼 태그를 푸시하면 GitHub Actions 가 서명된 AAB/APK 를 빌드해 Release 에 첨부한다 (시크릿 등록 필요).

## iOS

Apple 정책상 iOS 바이너리는 macOS + Xcode 에서만 빌드할 수 있다. `ios/` 프로젝트는 이미 생성되어 있다.

```bash
npm run build && npx cap sync ios
npx cap open ios      # Xcode 에서 실행 / Archive
```

Mac 이 없다면 아이폰 Safari 로 PWA 를 열고 **공유 → 홈 화면에 추가** 하면 앱처럼 설치된다.

## 프로젝트 구조

```
src/domain/     순수 로직 (문구 규칙, 시간, 세션, 알람, 통계, 상태/리듀서)  ← 100% 테스트 대상
src/ports/      플랫폼 경계 (storage / notifier / haptics + *.native.ts Capacitor 구현)
src/app/        스토어(영속·시계·알림 동기화), 라우터, 차임
src/screens/    온보딩 · 홈 · 알람 · 기록 · 설정
src/components/ Ring · BigButton · Toast · IntervalPicker · TypeChips
src/styles/     디자인 토큰(다크 기본, 라이트 자동) · 전역 스타일
android/ ios/   Capacitor 네이티브 프로젝트
docs/           기획서 · 프로토타입 · 테스트 계획
```

## 알림 동작 방식

| 플랫폼 | 방식 | 앱 종료 시 |
|---|---|---|
| Android | `@capacitor/local-notifications` → AlarmManager exact alarm (`USE_EXACT_ALARM`) | ✅ 도착 |
| iOS | UNUserNotificationCenter 로컬 알림 | ✅ 도착 |
| PWA | 앱이 열려 있는 동안 타이머 + Notification API, 재진입 시 지난 알람 감지 | ⚠️ 앱이 열려 있어야 함 |

알림 문구는 이름 받침에 따라 자동으로 `아/야` 를 붙인다: 지민 → **지민아~ 맘마먹자**, 수아 → **수아야~ 맘마먹자**.
