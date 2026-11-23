# Malikadai Bill Android v2.9 — final requested UI adjustments

1. **Before download:** The PDF button opens a receipt preview; **Edit** closes without downloading, **Download / Share PDF** generates the same bill.
2. **Theme:** Blue replaces violet in the header, controls, rate editor and icon resources.
3. **Footer:** Only the two fixed bottom-bar buttons are medium-sized; their minimum touch height remains 44 px. All other buttons retain their intended dimensions.
4. **Header:** Removed the redundant Tamil **விலை & பொருள்** button in both billing pages; the remaining Preview, language, speech, and help controls are right aligned in one compact row on phones. Rate management remains available through the prominent top-of-page link and the bottom bar.
5. Retains the fixed full-size PDF receipt, Tamil name corrections (மிளகாய்த்தூள், கல்லமாவு), and voice-billing features.

## Update your APK

Extract the ZIP and copy *all contents* into the existing GitHub Desktop repository (including `.github`). Commit and Push to `main`. On GitHub's Actions tab download the APK artifact from a **new successful** run. This ZIP is Android source, **not** an installable APK. Back up any locally stored rates before uninstalling an older debug build.
