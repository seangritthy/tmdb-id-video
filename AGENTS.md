# AGENTS.md - VDOmov Release Guidelines

## Release Protocol:
- Always bump `versionCode` and `versionName` in `android/app/build.gradle` and `version` in `package.json` for every new release.
- Build and verify APK using `zipalign -c -v 4` and `apksigner verify -v`.
- Always release exclusively to `seangritthy/vdomov-apks` (never release on private `seangritthy/vdomov`).
- Always attach all 5 variant assets: `app-release.apk`, `vdomov-mobile.apk`, `vdomov-tv.apk`, `vdomov-tablet.apk`, `vdomov-v<version>.apk`.
