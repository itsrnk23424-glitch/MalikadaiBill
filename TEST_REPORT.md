# Verification report — 23 November 2026

- Restored PDF source: same as approved v2.2 source project (original receipt style; compact 2.3 not used).
- Updated GitHub Android build workflow to `setup-android@v4`; official action no longer requests removed SDK `tools` package.
- Verified Android SDK API 35 / build-tools 35.0.0 configuration, Java 21 and Node 22 configuration against current docs.
- Node voice parser, server access checks, and Android manifest tests can be run with `npm run verify` without network.
- Android-native compilation, external npm dependency installation, and physical phone speech/share tests cannot be performed here; they require a working external build environment.
- An APK is only ready once a GitHub Actions run succeeds and uploads the `MalikadaiBill-Android-APK` artifact.
