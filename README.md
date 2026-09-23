# 쪽쪽 (zzokzzok) 🍼

아기 수유 시작/종료를 한 번의 탭으로 기록하고, 수유가 끝난 뒤 설정한 시간이 지나면
**"OO아~ 맘마먹자"** 알림으로 다음 수유 시간을 알려주는 앱.

- **Expo (React Native)** — 아이폰·안드로이드 한 코드. Expo Go 로 QR 스캔 즉시 테스트, EAS Build 로 APK/iOS 빌드
- 서버 없음. 모든 데이터는 기기 안에만 저장
- React 19 · TypeScript · expo-notifications(로컬 알림) · Jest + React Native Testing Library

> 이전 Capacitor(웹+네이티브 껍데기) 버전은 `capacitor-v0.1.0` 브랜치 / 태그 `v0.1.0` 에 보존.

## 문서

| 문서 | 내용 |
|---|---|
| [docs/01-기획서.md](docs/01-기획서.md) | 배경, 목표, 기능/비기능 요구사항(FR/NFR), 알림 정책, 데이터 모델 |
| [docs/02-프로토타입.md](docs/02-프로토타입.md) | 디자인 컨셉·토큰, 상태 머신, 화면 와이어프레임, 인터랙션, 파일 구조 |
| [docs/prototype/index.html](docs/prototype/index.html) | 클릭 가능한 저충실도 프로토타입 (브라우저로 열기) |
| [docs/03-테스트계획.md](docs/03-테스트계획.md) | 테스트 전략, 요구사항 ↔ 테스트케이스 매핑, 수동 QA 체크리스트 |
| [docs/04-배포가이드.md](docs/04-배포가이드.md) | Expo Go 공유, EAS Build(APK/iOS), 스토어 제출, 체크리스트 |
| [docs/privacy-policy.md](docs/privacy-policy.md) | 스토어 등록용 개인정보 처리방침 |

## 빠른 시작

```bash
npm install
npm test              # Jest (도메인 + 화면 흐름) 118개
npm start             # Expo 개발 서버 → 터미널 QR 을 Expo Go 로 스캔
npm run start:tunnel  # 다른 네트워크/WSL 에서도 폰이 접속되도록 터널 모드
```

폰에 **Expo Go** 앱(App Store / Play 스토어)을 설치하고 QR 을 스캔하면 바로 실행된다.

## 앱 파일 만들기 (EAS Build)

```bash
npx eas-cli login                  # Expo 계정 (무료)
npm run build:android:apk          # → 폰에 직접 설치 가능한 APK (preview 프로필)
npm run build:android:store        # → Google Play 업로드용 AAB
npm run build:ios                  # → iOS 빌드 (Apple 개발자 계정 필요, Mac 불필요)
```

빌드는 Expo 클라우드에서 돌고 완료되면 다운로드 링크/QR 이 나온다. 자세한 절차는 [배포 가이드](docs/04-배포가이드.md).

## 프로젝트 구조

```
index.ts            앱 진입 (registerRootComponent)
app.json / eas.json Expo 앱 설정 · EAS 빌드 프로필
src/domain/         순수 로직 (문구 규칙, 시간, 세션, 알람, 통계, 상태/리듀서) ← 프레임워크 무관, 98% 커버리지
src/ports/          플랫폼 경계 (storage=AsyncStorage / notifier=expo-notifications / haptics)
src/core/           스토어(영속·시계·알림 동기화), 라우터(App)
src/screens/        온보딩 · 홈 · 알람 · 기록 · 설정
src/components/     Ring · Mascot · Icon · Backdrop · ui(버튼/칩/카드/입력/토스트) · IntervalPicker · TypeChips
src/theme/          파스텔 팔레트(라이트 기본, 다크 자동)
assets/             아이콘 · 스플래시 · 알림 아이콘 · Jua 폰트
docs/               기획서 · 프로토타입 · 테스트 계획 · 배포 가이드
```

## 알림 동작 방식

| 상황 | 동작 |
|---|---|
| 수유 종료 | `종료 시각 + 간격` 에 로컬 알림 예약 (OS 가 앱 종료 후에도 발송) |
| Expo Go 테스트 | 로컬 알림은 Expo Go 에서도 동작. 알림을 누르면 Expo Go 가 열린다 |
| Android 정확 알람 | `USE_EXACT_ALARM` 권한 선언 (EAS 빌드 산출물에 적용) |

알림 문구는 이름 받침에 따라 자동으로 `아/야` 를 붙인다: 지민 → **지민아~ 맘마먹자**, 수아 → **수아야~ 맘마먹자**.
