# Malikadai Bill Voice Pro — Verification report
Date: 23 November 2026

## Completed in the current environment

| Check | Result |
|---|---|
| Automated JavaScript voice parser tests (12) | PASS |
| Private transcription server security test (1) | PASS |
| Syntax checks for JS application, server and scripts | PASS |
| Simulated mobile browser: 320, 360, 390, 430 CSS pixels | PASS, no horizontal overflow |
| Mobile bill review and apply (3 items, paid ₹500) | PASS: total ₹612.50, due ₹112.50 |
| Mobile inventory page, add and search item at four widths | PASS |
| Native Android APK compilation | NOT RUN; Android SDK/Gradle and npm registry unavailable here |
| Physical Android microphone, save/share PDF, install | NOT RUN; no authorized connected phone |
| Xcode iOS simulator build | NOT RUN; Xcode/macOS unavailable here |
| Signed physical iPhone app and device testing | NOT RUN; requires Mac, iPhone, signing |
| Optional cloud `gpt-transcribe` end-to-end | NOT RUN; private server, API credentials, and access required |

## Test procedure
- `npm test` (20 PASS with Node.js 22)
- `node --check` on local JS modules and scripts (no syntax errors)
- Headless Chromium on desktop, using a mobile viewport and touch emulation; native runtime is not loaded in this test. Manual voice transcript is injected as if transcribed, reviewed, confirmed, then amounts are checked.
- Inventory form: add a new item, search for it, inspect browser errors.

## Boundaries
- Browser simulation is not a physical-phone test, and manual typed transcripts do not test real speech recognition or hardware microphones.
- Tests do not prove the native APK/IPA will compile. CI workflows in `.github/workflows/` compile them when run by a configured build service.
- AI server tests check authorization, CORS and error paths only; no real external transcription request was made.
- Internet-disabled container prevented npm install and native build; no APK or IPA was produced.

Android 2.2: Added manifest configuration + idempotence test, synchronized language switcher, sanitized PDF receipt text. Previous browser tests rerun at 320/360/390/430px. Native APK still not compiled.


## Compact PDF receipt enhancement (Android 2.3)
- Reduced receipt paper width from 90mm to 80mm and removed duplicate date/extra spacing.
- Added fixed-resolution rendering and adaptive compressed JPEG output; no image cropping or item omissions.
- Ran a Chromium/PyMuPDF visual comparison of a 3-line Tamil receipt: ~43.9 KB prior PDF vs ~24.1 KB optimized PDF using comparable raster insertion. The exact browser-compressed JPEG produced a sample PDF of 18.6 KB. These are representative samples, not guarantees for every bill.
- Confirmed Tamil text, totals, and dues are visible in a rendered PDF. Tests run on desktop browser and PDF emulator, not Android native sharing.
