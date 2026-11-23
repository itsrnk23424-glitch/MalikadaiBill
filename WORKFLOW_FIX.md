# Why the old GitHub build failed

Old workflow: `android-actions/setup-android@v3` attempted `sdkmanager tools`.
Google no longer offers `tools`, leading to exit code 1.

This project contains `.github/workflows/android-apk.yml` using **`android-actions/setup-android@v4`** and explicit current SDK packages:

`platform-tools platforms;android-35 build-tools;35.0.0`

This also upgrades checkout, Node and Java actions, supports both manual and push-triggered builds, and uploads a debug APK with SHA-256 checksum.

The old failed run's logs will **always** show v3; start a NEW run after committing the updated files.
