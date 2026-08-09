# Release Policy & Workflow Rule for VDOmov

## Release Rules:
1. **Always Increment Version**: On every release request, bump `package.json` version and `android/app/build.gradle` `versionName` and `versionCode` (e.g. `1.1.7`, `versionCode 17`).
2. **Dedicated Production Signing**: Sign all release APKs with `release.keystore` (`CN=VDOmov`, 4096-bit RSA) using `v1SigningEnabled true` and `v2SigningEnabled true`.
3. **Exclusive Release Target Repository**:
   - **DO NOT** create GitHub releases on private `seangritthy/vdomov`.
   - **ALWAYS** publish GitHub releases exclusively to `seangritthy/vdomov-apks`.
4. **Bundle All Variant APK Assets**:
   Upload the following 5 assets to every GitHub release on `seangritthy/vdomov-apks`:
   - `app-release.apk`
   - `vdomov-mobile.apk`
   - `vdomov-tv.apk`
   - `vdomov-tablet.apk`
   - `vdomov-v<version>.apk`
5. **In-App Updater & Web Downloads**:
   - In-app updater checks: `https://api.github.com/repos/seangritthy/vdomov-apks/releases/latest`
   - Web dropdown links: `https://github.com/seangritthy/vdomov-apks/releases/latest/download/vdomov-mobile.apk`
