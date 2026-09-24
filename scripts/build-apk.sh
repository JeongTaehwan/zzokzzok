#!/usr/bin/env bash
# 안드로이드 APK 로컬 빌드 (Expo 계정 불필요)
#   expo prebuild → 릴리스 서명 설정 주입 → Gradle assembleRelease → release/zzokzzok-<버전>.apk
# 준비물: ~/.local/jdk-21, ~/.local/android-sdk (platform 36, build-tools 36, ndk 27.1.12297006, cmake 3.22.1),
#         credentials/zzokzzok-upload.jks + credentials/keystore.properties
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/android-env.sh

VERSION="$(node -p "require('./app.json').expo.version")"
ARCHS="${ARCHS:-armeabi-v7a,arm64-v8a}"   # 실기기용. 에뮬레이터도 필요하면 ARCHS=armeabi-v7a,arm64-v8a,x86_64

[ -f credentials/keystore.properties ] || { echo "credentials/keystore.properties 가 없어요 (서명 키)"; exit 1; }

echo "== [1/4] expo prebuild (android) =="
CI=1 EXPO_NO_TELEMETRY=1 npx expo prebuild --platform android --clean --no-install 2>&1 | tail -2
node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.scripts.android='expo start --android';p.scripts.ios='expo start --ios';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n')"   # prebuild 가 바꾼 scripts 되돌림

echo "== [2/4] 서명·아키텍처 설정 주입 =="
python3 - "$ARCHS" <<'PY'
import re, sys
archs = sys.argv[1]
p = 'android/app/build.gradle'; s = open(p).read()
if 'keystoreProperties' not in s:
    s = s.replace("apply plugin: \"com.android.application\"", """apply plugin: "com.android.application"

def keystorePropertiesFile = rootProject.file("../credentials/keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}""", 1)
    s = s.replace("""    signingConfigs {
        debug {""", """    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                storeFile rootProject.file("../credentials/" + new File(keystoreProperties['storeFile']).getName())
                storePassword keystoreProperties['storePassword']
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
            }
        }
        debug {""", 1)
    # buildTypes.release 의 signingConfig 만 release 로 (debug 빌드타입은 그대로)
    bt = s.index('buildTypes {')
    rel = s.index('release {', bt)
    s = s[:rel] + s[rel:].replace('signingConfig signingConfigs.debug', 'signingConfig signingConfigs.release', 1)
    open(p, 'w').write(s)
g = 'android/gradle.properties'; t = open(g).read()
t = re.sub(r"reactNativeArchitectures=.*", f"reactNativeArchitectures={archs}", t)
t = t.replace("org.gradle.jvmargs=-Xmx2048m", "org.gradle.jvmargs=-Xmx3072m")
open(g, 'w').write(t)
print("signing/archs patched")
PY
grep -n "signingConfigs.release" android/app/build.gradle | head -2
grep -c "signingConfigs.debug" android/app/build.gradle | sed 's/^/debug 참조 수: /'

echo "== [3/4] gradle assembleRelease =="
cd android
chmod +x gradlew
./gradlew assembleRelease --no-daemon --console=plain 2>&1 | grep -E "BUILD|error:|FAILED|> Task :app:assembleRelease" | tail -5
cd ..

echo "== [4/4] 산출물 =="
mkdir -p release
cp android/app/build/outputs/apk/release/app-release.apk "release/zzokzzok-$VERSION.apk"
BT="$ANDROID_HOME/build-tools/36.0.0"
"$BT/apksigner" verify --print-certs "release/zzokzzok-$VERSION.apk" 2>/dev/null | head -2
"$BT/aapt2" dump badging "release/zzokzzok-$VERSION.apk" 2>/dev/null | grep -E "^package|targetSdkVersion|application-label:" | head -3
ls -la "release/zzokzzok-$VERSION.apk"
echo "APK_OK release/zzokzzok-$VERSION.apk"
