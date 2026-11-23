# Malikadai Bill — Android Voice Pro 2.4 (original PDF restored)

**This is the COMPLETE Android source project for GitHub Actions. It is not an APK yet.**

## Included

- Tamil, Tanglish and English voice billing with quantity review before applying
- Existing editable product catalog, customer name, paid and due calculations
- **Original PDF generator from the approved 2.2 version** (not compact PDF 2.3)
- Native microphone recognition and Android PDF share sheet
- Optional advanced transcription server (requires hosting and API credentials; not enabled)
- App icon, splash source images and all build/test configuration
- `.github/workflows/android-apk.yml` — **fixed `setup-android@v4`**; auto-builds on push to `main` and supports manual build

## First: upload the full project (not the ZIP alone)

**Recommended for your existing GitHub repository:**

1. Download this ZIP and extract it on Windows. Open the extracted folder (`package.json`, `index.html`, `src`, `assets`, `.github` should be inside).
2. Open GitHub Desktop: https://desktop.github.com/ and sign in.
3. `File > Clone repository`, choose your existing `MalikadaiBill` repository (the one you showed in your screenshots).
4. Open that local repository folder in Windows File Explorer. Copy the contents of the EXTRACTED new project folder into it, replacing old files. Delete the obsolete `COMPACT_PDF_NOTES.md` file if it remains from the older repository. **Ensure the `.github/workflows/android-apk.yml` file replaces the old v3 version.**
5. Back in GitHub Desktop, enter a commit summary like `Fix Android voice app and APK workflow`, click **Commit to main**, then **Push origin**.
6. On GitHub website, choose **Actions > Build Malikadai Android APK**. A push to `main` will usually start it automatically; you can also use **Run workflow**.
7. After a green successful run, click the run and download the `MalikadaiBill-Android-APK` artifact. Extract the artifact ZIP to obtain `app-debug.apk`.
8. Transfer `app-debug.apk` to your Android phone. Open it, grant install permission for your file manager if asked, and install. Grant microphone permission inside the app.

### If you prefer the GitHub website only

Upload every project file and folder under the repository ROOT, not inside an extra nested directory. For hidden folders (`.github`), the browser upload may be unreliable: verify `Code > .github > workflows > android-apk.yml` explicitly and paste in the one from this ZIP if missing. Remove stale files from old copies when needed. **Do not upload only the ZIP archive.**

## Verify a sample bill

Tap **🎙 பேசுங்கள் / Speak**. Say `மல்லி 2 கிலோ, சிக்கன் அரை கிலோ, சீரகம் 250 கிராம், வரவு 500`. Confirm the proposed items and tap **Add to bill**. At the included default prices, expected subtotal = ₹612.50, paid = ₹500, due = ₹112.50. Update prices for your actual shop.

## Limits and safety

- Actual **APK build and real-phone testing have not run** in this chat's runtime (no Android SDK or npm registry access). If GitHub's build fails, inspect the FIRST failed job step and share that error log. No APK is present in this ZIP.
- Device speech depends on its installed recognition service and language pack, and may require internet.
- Advanced AI mode needs a separate secure HTTPS transcription server; never commit an API key to a GitHub repository.
- Rate and product edits are stored locally on that phone. Back them up before clearing app data or uninstalling.
- This debug APK is for personal use; it is not a Google Play release build.

## Files of note

- `.github/workflows/android-apk.yml` — complete fixed cloud workflow, checked into this project
- `GET_ANDROID_APK.md` / `ANDROID_START_HERE.md` — detailed Android installation guide
- `src/voice-parser.js` / `src/voice-ui.js` — local command parsing and confirmation
- `src/mobile-bridge.js` — native speech and PDF sharing
- `scripts/prepare-android-manifest.mjs` — microphone/recognizer declarations
- `ADVANCED_VOICE_SETUP.md` — optional private AI server

## Local builds (optional)

Requires Node 22, JDK 21, Android SDK. Run:

```bash
npm install --no-audit --no-fund
npm run verify
npm run build
npx cap add android
npm run icons
npx cap sync android
node scripts/prepare-android-manifest.mjs
cd android
./gradlew assembleDebug
```

APK output: `android/app/build/outputs/apk/debug/app-debug.apk`.
