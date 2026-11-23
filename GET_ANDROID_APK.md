# How to get the Android APK from GitHub

This project ZIP contains all code and the **updated** workflow; the ZIP itself is not installable.

1. Extract this ZIP. Keep the project files together and at the GitHub repository root (NOT a nested folder). Use GitHub Desktop to overwrite the old files in your existing `MalikadaiBill` repository and **Push origin**. See `README.md` for detailed Windows steps.
2. IMPORTANT: In your GitHub **Code** tab, open `.github/workflows/android-apk.yml`. Confirm it has `android-actions/setup-android@v4`, **not `@v3`**, and has both `push:` and `workflow_dispatch:` triggers.
3. Open **Actions > Build Malikadai Android APK**. A new push to `main` automatically begins a new build. If not, select **Run workflow > Run workflow**.
4. Open the NEW build run, not an older failed build. The green check means the APK was compiled. Under **Artifacts**, download `MalikadaiBill-Android-APK` and extract it.
5. Copy `app-debug.apk` to your Android phone and install. Allow the file manager to install unknown apps if Android asks, then grant microphone access.
6. Test 3 Tamil/Tanglish items, adjust a rate, and share the original-format PDF.

If GitHub shows a RED X: open the job **Build and test Android APK**, expand the FIRST failed step, and send the error to ChatGPT. The workflow is configured to print useful build errors.

This is a personal-use debug APK; do not post private shop data or API credentials publicly.
