# Malikadai Bill — Android APK (personal use)

**This ZIP is a build-ready Android project, NOT an APK.** The source has been prepared for a one-click cloud build, but the APK must be produced by a build machine before installation.

## Get an installable APK without Android Studio

1. Sign in to GitHub and create a **private repository**.
2. Extract `MalikadaiBill_Android_Voice_Pro` from this ZIP. Upload the *contents of that folder* into the repository root, including the hidden `.github` directory. (GitHub's web upload may not preserve hidden folders: use GitHub Desktop if needed.)
3. In your repository, open **Actions**. Select **Build Malikadai Android APK**, then **Run workflow**.
4. Once the job succeeds, download the `MalikadaiBill-Android-APK` artifact from that workflow run. Extract it to locate **app-debug.apk**.
5. Transfer `app-debug.apk` to your Android phone and tap it. Allow installation from your file manager when Android asks.
6. Start **Malikadai Bill**, grant microphone access, and test a sample bill.

Your personal-use **debug APK** is signed automatically by the Android build tooling. It does not need to be published on Google Play.

If the GitHub build fails, copy the build log and send it here so the project can be fixed. An APK build has **not** been run or verified in this environment.

## Sample voice bill

Tap **🎙 பேசுங்கள் / Speak**, speak: `மல்லி 2 கிலோ, சிக்கன் அரை கிலோ, சீரகம் 250 கிராம், வரவு 500`.
Review recognized products/quantities and tap **Add to bill**. Expected subtotal from the default rates is ₹612.50; paid ₹500; due ₹112.50. These are example rates only, so change prices in **விலை & பொருள்** before actual shop use.

## What requires a phone

The phone must have Android speech recognition available for Tamil or English (some phones need network/language packs). The app should ask for microphone permission. Check PDF save/share after installing. Products and rates are saved locally on that one phone and may be erased if you clear app data or uninstall.

## Optional premium transcription

Advanced AI is *not* automatically activated by installing the APK. It needs a separately configured private HTTPS server and API credentials (see `ADVANCED_VOICE_SETUP.md`). The default phone recognition needs no OpenAI key.

## Local Android Studio alternative

Install Node 22+, JDK 21, Android Studio/SDK. Then from this folder:

```bash
npm install
npm run verify
npm run build
npx cap add android
npx --yes @capacitor/assets@4.0.0 generate --android
npx cap sync android
node scripts/prepare-android-manifest.mjs
cd android
./gradlew assembleDebug
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`.
